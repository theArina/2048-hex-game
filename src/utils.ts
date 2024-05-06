import { Point, Coordinate } from './types';

const applyFunctionInRange = (limit: number, f: (n: number) => void): void => {
  Array.from(
    { length: limit * 2 + 1 },
    (_, x) => limit - x,
  ).forEach(f);
};

const getFieldCoordinates = (n: number): Coordinate[] => {
  const coordinates: Coordinate[] = [];
  const limit = n - 1;
  applyFunctionInRange(limit, (x) => {
    applyFunctionInRange(limit, (y) => {
      applyFunctionInRange(limit, (z) => {
        if (x + y + z === 0) {
          coordinates.push({ x, y, z });
        }
      });
    });
  });
  return coordinates;
};

const selectRandomElements = <T>(array: T[], count: number): T[] => {
  return array
    .map((v) => ({ order: Math.random(), v })) // Assign a random order to each element
    .sort((a, b) => a.order - b.order) // Sort by the random order
    .map(({ v }) => v) // Retrieve the original values
    .slice(0, count); // Select the first n elements
};

const arePointsSame = (a: Coordinate, b: Coordinate): boolean => {
  return !['x', 'y', 'z'].some((it) => a[it] !== b[it]);
};

export const getRandomPoints = (radius: number, points: Point[]): Point[] => {
  const fieldCoordinates = getFieldCoordinates(radius);
  const availablePositions = fieldCoordinates
    .filter((a) => points.every(b => !arePointsSame(a, b)));
  const pointsCount = Math.min(
    availablePositions.length,
    points.length === 0 ? 3 : 1 + (Math.random() > 0.8 ? 1 : 0),
  );
  const pointValue = points.length === 0 ? 2 : Math.random() > 0.5 ? 2 : 4;
  return selectRandomElements(availablePositions, pointsCount)
    .map((it: object) => {
      return { ...it, pointValue } as Point;
    });
};