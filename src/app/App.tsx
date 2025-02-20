import { ColorPickerPanel, DrawingBoard } from 'features/ImageEditor';

const sectors = [
  {
    points: [
      [0, 0],
      [200, 0],
      [200, 200],
      [0, 200],
    ],
    color: '#808080',
  },
  {
    points: [
      [200, 0],
      [400, 0],
      [400, 200],
      [200, 200],
    ],
    color: '#FF0000',
  },
  {
    points: [
      [100, 200],
      [300, 200],
      [300, 400],
      [100, 400],
    ],
    color: '#0000FF',
  },
];

const sectorsColorList = sectors.map((sector) => sector.color);

export function App() {
  return (
    <>
      <DrawingBoard sectorList={sectors} />
      <ColorPickerPanel colorList={sectorsColorList} />
    </>
  );
}
