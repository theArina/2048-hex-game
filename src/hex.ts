import { extendHex } from 'honeycomb-grid';
import palette from './palette.json';
import constants from './constants.json';

const { MIN_FONT_SIZE } = constants;

function render({ svg, points, showCoordinates = false }) {
  const position = this.toPoint();
  const centerPosition = this.center().add(position);
  const { q: x, s: y, r: z } = this.toCube(this);
  const coordinates = [x, y, z].join(',');

  const pointValue = points[coordinates];
  const pointStringValue = pointValue?.toString() || '';

  const polygon = svg
    .polygon(this.corners().map(({ x, y }) => `${x},${y}`))
    .fill(palette[pointStringValue])
    .stroke({ width: 1, color: palette.line })
    .translate(position.x, position.y)
    .attr('data-x', x)
    .attr('data-y', y)
    .attr('data-z', z)
    .attr('data-value', pointValue || 0);

  const size = this.center().x;
  const calculatedFontSize = size / 2.5;
  const fontSize = calculatedFontSize < MIN_FONT_SIZE ? MIN_FONT_SIZE : calculatedFontSize;

  const text = svg
    .text(showCoordinates ? coordinates : pointStringValue)
    .font({
      size: fontSize,
      anchor: 'middle',
      fill: pointValue >= 8 ? palette.text.light : palette.text.dark,
    })
    .translate(centerPosition.x, centerPosition.y + fontSize / 4);

  svg
    .group()
    .add(polygon)
    .add(text);
}

export function createHex(ratio = 1) {
  return extendHex({
    orientation: 'flat',
    size: 100 * ratio,
    render,
  });
}
