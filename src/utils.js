const applyFunctionInRange = (limit, f) => {
  Array.from(
    { length: limit * 2 + 1 },
    (_, x) => limit - x,
  ).forEach(f);
};

const getFieldCoordinates = (n) => {
  const coordinates = [];
  const limit = n - 1;
  applyFunctionInRange(limit, x => {
    applyFunctionInRange(limit, y => {
      applyFunctionInRange(limit, z => {
        if (x + y + z === 0) {
          coordinates.push({ x, y, z });
        }
      });
    });
  });
  return coordinates;
};

const selectRandomElements = (array, n) =>
  array
    .map(a => ({ order: Math.random(), value: a }))
    .sort((a, b) => a.order - b.order)
    .map(a => a.value)
    .slice(0, n);

const arePointsSame = (a, b) => !['x', 'y', 'z'].some(v => a[v] !== b[v]);

export function getRandomPoints(radius, userPoints) {
  const availablePositions = getFieldCoordinates(radius).filter(a => userPoints.every(b => !arePointsSame(a, b)));
  const pointsCount = Math.min(availablePositions.length, userPoints.length === 0 ? 3 : 1 + (Math.random() > 0.8 ? 1 : 0));
  const selectedValue = userPoints.length === 0 ? 2 : Math.random() > 0.5 ? 2 : 4;
  return selectRandomElements(availablePositions, pointsCount).map(p => ({ ...p, value: selectedValue }));
}