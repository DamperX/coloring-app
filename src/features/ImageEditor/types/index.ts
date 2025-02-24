export type Coordinate = [number, number];

export type Zone = {
  id: string;
  points: Coordinate[];
  colorId: string;
};

export type Color = {
  id: string;
  hex: string;
};

export type Position = {
  x: number;
  y: number;
};
