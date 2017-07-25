/*
  This is an example of swirling circles clipped by a 1.5 cm margin.
*/

import { PaperSize, Orientation } from 'penplot';
import { polylinesToSVG } from 'penplot/util/svg';
import { clipPolylinesToBox } from 'penplot/util/geom';

export const orientation = Orientation.PORTRAIT;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  let lines = [];

  // Fill the array of lines
  const steps = 256;
  const circle = [];
  for (let i = 0; i < steps; i++) {
    const t = i / Math.max(1, steps - 1);
    const radius = 20 * t;
    const swirl = 30;
    const angle = Math.PI * 2 * t * swirl;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const cx = width / 2;
    const cy = height / 2;
    circle.push([ x + cx, y + cy ]);
  }
  lines.push(circle);

  // Clip all the lines to a margin
  const margin = 1.5;
  const box = [ margin, margin, width - margin, height - margin ];
  lines = clipPolylinesToBox(lines, box);

  return {
    draw,
    print,
    background: 'white',
    animate: false,
    clear: true
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
