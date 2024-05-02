import { defineHex, hexToPoint, Orientation } from 'honeycomb-grid';
import palette from './palette.json';
import constants from './constants.json';

const { MIN_FONT_SIZE } = constants;

export function render({ hex, svg, points, showCoordinates = false }) {
  const position = hexToPoint(hex);
  const { q: x, s: y, r: z } = hex;
  const coordinates = [x, y, z].join(',');

  const pointValue = points[coordinates];
  const pointStringValue = pointValue?.toString() || '';

  const polygon = svg
    .polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
    .fill(palette[pointStringValue])
    .stroke({ width: 1, color: palette.line })
    .attr('data-x', x)
    .attr('data-y', y)
    .attr('data-z', z)
    .attr('data-value', pointValue || 0);

  const size = hex.width / 2;
  const calculatedFontSize = size / 2.5;
  const fontSize = calculatedFontSize < MIN_FONT_SIZE ? MIN_FONT_SIZE : calculatedFontSize;

  const text = svg
    .text(showCoordinates ? coordinates : pointStringValue)
    .font({
      size: fontSize,
      anchor: 'middle',
      fill: pointValue >= 8 ? palette.text.light : palette.text.dark,
    })
    .translate(position.x, position.y + fontSize / 4);

  svg
    .group()
    .add(polygon)
    .add(text);
}

export function createHex(ratio = 1) {
  return defineHex({
    orientation: Orientation.FLAT,
    dimensions: 100 * ratio,
    origin: 'topLeft',
  });
}
