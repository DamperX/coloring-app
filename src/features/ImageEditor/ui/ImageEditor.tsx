import { ColorPickerPanel } from './ColorPickerPanel.tsx';
import { DrawingBoard } from './DrawingBoard.tsx';
import { Color, Zone } from '../types';
import { useState } from 'react';

const initialZones: Zone[] = [
  {
    id: 'zone1',
    points: [
      [0, 0],
      [200, 0],
      [200, 200],
      [0, 200],
    ],
    colorId: 'color1',
  },
  {
    id: 'zone2',
    points: [
      [200, 0],
      [400, 0],
      [400, 200],
      [200, 200],
    ],
    colorId: 'color1',
  },
  {
    id: 'zone3',
    points: [
      [100, 200],
      [300, 200],
      [300, 400],
      [100, 400],
    ],
    colorId: 'color2',
  },
];

const initialColors: Color[] = [
  { id: 'color1', hex: '#FF0000' },
  { id: 'color2', hex: '#0000FF' },
];

export const ImageEditor = () => {
  const [activeColorId, setActiveColorId] = useState<string | null>(null);

  return (
    <div>
      <DrawingBoard
        activeColorId={activeColorId}
        colorList={initialColors}
        zoneList={initialZones}
      />
      <ColorPickerPanel
        activeColorId={activeColorId}
        colorList={initialColors}
        onSelect={setActiveColorId}
      />
    </div>
  );
};
