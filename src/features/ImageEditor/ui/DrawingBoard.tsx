import { Layer, Shape, Stage } from 'react-konva';
import { SectorList } from '../types';
import { useRef } from 'react';
import Konva from 'konva';
import { getCenter, getDistance } from '../lib/utils.ts';

type Props = {
  sectorList: SectorList;
};

Konva.hitOnDragEnabled = true;

const drawShapeScene = (points: number[][]) => (context: Konva.Context) => {
  context.beginPath();
  const [startX, startY] = points[0];
  context.moveTo(startX, startY);
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    context.lineTo(x, y);
  }
  context.closePath();
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.stroke();
};

export const DrawingBoard = ({ sectorList }: Props) => {
  const stageRef = useRef<Konva.Stage>(null);
  const lastDist = useRef<number>(0);
  const dragStopped = useRef<boolean>(false);

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();

    if (!stageRef.current) {
      return;
    }

    const [touch1, touch2] = e.evt.touches;

    if (touch1 && !touch2 && !stageRef.current.isDragging() && dragStopped) {
      stageRef.current.startDrag();
      dragStopped.current = false;
    }

    if (touch1 && touch2) {
      if (stageRef.current.isDragging()) {
        dragStopped.current = true;
        stageRef.current.stopDrag();
      }

      const dist = getDistance(
        {
          x: touch1.clientX,
          y: touch1.clientY,
        },
        {
          x: touch2.clientX,
          y: touch2.clientY,
        },
      );

      if (lastDist.current > 0) {
        const scaleFactor = dist / lastDist.current;
        const newScale = stageRef.current.scaleX() * scaleFactor;
        stageRef.current.scale({ x: newScale, y: newScale });

        const center = getCenter(
          {
            x: touch1.clientX,
            y: touch1.clientY,
          },
          {
            x: touch2.clientX,
            y: touch2.clientY,
          },
        );

        stageRef.current.position({
          x: center.x - (center.x - stageRef.current.x()) * scaleFactor,
          y: center.y - (center.y - stageRef.current.y()) * scaleFactor,
        });
        stageRef.current.batchDraw();
      }

      lastDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Layer>
        {sectorList.map((sector, index) => (
          <Shape key={index} sceneFunc={drawShapeScene(sector.points)} />
        ))}
        <Shape />
      </Layer>
    </Stage>
  );
};
