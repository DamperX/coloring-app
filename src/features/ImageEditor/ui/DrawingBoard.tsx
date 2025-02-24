import { Layer, Shape, Stage } from 'react-konva';
import { Color, Coordinate, Zone } from '../types';
import { useCallback, useRef, useState } from 'react';
import Konva from 'konva';
import { getCenter, getDistance } from '../lib/utils.ts';

type Props = {
  zoneList: Zone[];
  activeColorId: string | null;
  colorList: Color[];
};

type Line = {
  points: Coordinate[];
  lineSize: number;
  zoneId: string;
};

Konva.hitOnDragEnabled = true;

const isPointInPolygon = (
  point: Coordinate,
  polygon: Coordinate[],
): boolean => {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const transformZonePoints = (
  points: Coordinate[],
  scaleX: number,
  scaleY: number,
  offsetX: number,
  offsetY: number,
): Coordinate[] => {
  return points.map(([x, y]) => [x * scaleX + offsetX, y * scaleY + offsetY]);
};

export const DrawingBoard = ({ zoneList, colorList, activeColorId }: Props) => {
  const lastDist = useRef<number>(0);
  const lastPos = useRef<{
    size?: number;
    points: Coordinate;
  }>(null);
  const dragStopped = useRef<boolean>(false);
  const isTouchInActiveZone = useRef<boolean>(false);
  const [lines, setLines] = useState<Line[]>([]);

  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();

    if (!stage) {
      return;
    }

    const [touch1, touch2] = e.evt.touches;

    if (touch1 && !touch2) {
      const pos = stage.getPointerPosition();

      if (!pos) {
        return;
      }

      const transformedPos = {
        x: (pos.x - stage.x()) / stage.scaleX(),
        y: (pos.y - stage.y()) / stage.scaleY(),
      };

      const [layer] = stage.getLayers();
      const shape = layer.getIntersection(transformedPos);

      if (!shape) {
        return;
      }

      const isActive = shape.getAttr('data').isActive ?? false;

      isTouchInActiveZone.current = isActive;

      if (!isActive) {
        return;
      }

      const size = Math.max(touch1.radiusX, touch1.radiusY) * 2;

      lastPos.current = {
        size,
        points: [transformedPos.x, transformedPos.y],
      };

      setLines((prevLines) => [
        ...prevLines,
        {
          points: [[transformedPos.x, transformedPos.y]],
          lineSize: size,
          zoneId: shape.id(),
        },
      ]);
    }
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) {
      return;
    }

    const [layer1] = stage.getLayers();

    if (isTouchInActiveZone.current && stage.isDragging()) {
      stage.stopDrag();
      const pos = stage.getPointerPosition();

      if (!pos) {
        return;
      }

      const stageScaleX = stage.scaleX();
      const stageScaleY = stage.scaleY();
      const stageX = stage.x();
      const stageY = stage.y();

      const transformedPos = {
        x: (pos.x - stageX) / stageScaleX,
        y: (pos.y - stageY) / stageScaleY,
      };

      const shape = layer1.getIntersection(transformedPos);

      if (!shape) {
        return;
      }

      const { isActive, points } = shape.getAttr('data') as {
        isActive: false;
        points: [number, number][];
      };

      const lastPosCoordinates = lastPos.current;

      if (isActive && lastPosCoordinates) {
        const scaledPoints = transformZonePoints(
          points,
          stageScaleX,
          stageScaleY,
          stageX / stageScaleX,
          stageY / stageScaleY,
        );
        const endPoints: Coordinate = [transformedPos.x, transformedPos.y];

        if (
          !isPointInPolygon(lastPosCoordinates.points, scaledPoints) &&
          !isPointInPolygon(endPoints, scaledPoints)
        ) {
          return;
        }

        setLines((prevLines) => [
          ...prevLines,
          {
            points: [
              lastPosCoordinates.points,
              [transformedPos.x, transformedPos.y],
            ],
            lineSize: lastPosCoordinates.size || 30,
            zoneId: shape.id(),
          },
        ]);
        lastPos.current = {
          ...lastPos.current,
          points: [transformedPos.x, transformedPos.y],
        };
      }

      return;
    }

    const [touch1, touch2] = e.evt.touches;

    if (touch1 && !touch2) {
      if (!stage.isDragging() && dragStopped) {
        stage.startDrag();
        dragStopped.current = false;
      } else {
        const pos = stage.getPointerPosition();

        if (!pos) {
          return;
        }

        const transformedPos = {
          x: (pos.x - stage.x()) / stage.scaleX(),
          y: (pos.y - stage.y()) / stage.scaleY(),
        };

        const [layer] = stage.getLayers();
        const shape = layer.getIntersection(transformedPos);

        if (!shape) {
          return;
        }

        if (shape.getAttr('data').isActive) {
          if (stage.isDragging()) {
            stage.stopDrag();
            dragStopped.current = true;
          }
          return;
        }
      }
    } else {
      if (stage.isDragging()) {
        dragStopped.current = true;
        stage.stopDrag();
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
        const newScale = stage.scaleX() * scaleFactor;
        stage.scale({ x: newScale, y: newScale });

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

        stage.position({
          x: center.x - (center.x - stage.x()) * scaleFactor,
          y: center.y - (center.y - stage.y()) * scaleFactor,
        });

        stage.batchDraw();
      }

      lastDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    dragStopped.current = false;
    isTouchInActiveZone.current = false;
    lastPos.current = null;
  };

  const drawShapeScene = useCallback(
    ({ points, isActive }: { points: Coordinate[]; isActive: boolean }) =>
      (context: Konva.Context, shape: Konva.Shape) => {
        context.beginPath();
        const [startX, startY] = points[0];
        context.moveTo(startX, startY);
        for (let i = 1; i < points.length; i++) {
          const [x, y] = points[i];
          context.lineTo(x, y);
        }
        context.closePath();

        context.strokeStyle = isActive ? 'black' : 'darkgray';
        context.lineWidth = isActive ? 1.5 : 1;
        context.stroke();

        if (isActive) {
          context.fillStyle = '#eeeeee';
          context.fill();
        }
        context.fillStrokeShape(shape);
      },
    [],
  );

  const drawLineScene = useCallback(
    ({
      points,
      color,
      lineSize,
    }: {
      points: Coordinate[];
      color: string;
      lineSize: number;
    }) =>
      (context: Konva.Context) => {
        context.beginPath();
        const [startX, startY] = points[0];
        context.moveTo(startX, startY);
        for (let i = 1; i < points.length; i++) {
          const [x, y] = points[i];
          context.lineTo(x, y);
        }
        context.strokeStyle = color;
        context.lineWidth = lineSize;
        context.lineCap = 'round';
        context.stroke();
      },
    [],
  );

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Layer>
        {zoneList.map(({ id, points, colorId }) => {
          const isActive = activeColorId === colorId;

          return (
            <Shape
              key={id}
              id={id}
              sceneFunc={drawShapeScene({
                points,
                isActive,
              })}
              data={{ isActive, points }}
            />
          );
        })}
        <Shape />
      </Layer>
      <Layer>
        {lines.map(({ points, lineSize, zoneId }, i) => {
          const colorId = zoneList.find(({ id }) => id === zoneId)?.colorId;
          const color =
            colorList.find(({ id }) => id === colorId)?.hex ?? '№000000';
          return (
            <Shape
              key={i}
              sceneFunc={drawLineScene({
                points,
                lineSize,
                color,
              })}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};
