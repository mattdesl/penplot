/*
  This is a basic example of a plot that could be sent
  to AxiDraw V3 and similar pen plotters.
*/

import newArray from 'new-array';

import { PaperSize, Orientation } from 'penplot';
import { randomFloat, setSeed } from 'penplot/util/random';
import { polylinesToSVG } from 'penplot/util/svg';

setSeed(2);

export const orientation = Orientation.PORTRAIT;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  const lineCount = 20;
  const segments = 500;
  const radius = 2;

  const lines = newArray(lineCount).map((_, j) => {
    const angleOffset = randomFloat(-Math.PI * 2, Math.PI * 2);
    const angleScale = randomFloat(0.001, 1);

    return newArray(segments).map((_, i) => {
      const t = i / (segments - 1);
      const angle = (Math.PI * 2 * t + angleOffset) * angleScale;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      const offset = j * 0.2;
      const r = radius + offset;
      return [ x * r + width / 2, y * r + height / 2 ];
    });
  });

  return {
    draw,
    print,
    clear: true,
    background: 'white'
  };

  function draw () {
    lines.forEach(points => {
      context.beginPath();
      points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });
  }

  function print () {
    return polylinesToSVG(lines, {
      dimensions
    });
  }
}
