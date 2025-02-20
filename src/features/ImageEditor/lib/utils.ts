import { Position } from '../types';

export function getDistance(p1: Position, p2: Position) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function getCenter(p1: Position, p2: Position) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}
