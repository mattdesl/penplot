import newArray from 'new-array';

import penplot, { PaperSize, Orientation } from '../../';
import { randomFloat, setSeed } from '../../random';
import { polylinesToSVG } from '../../svg';

setSeed(2);

export default penplot(createPlot, {
  dimensions: PaperSize.LETTER,
  orientation: Orientation.PORTRAIT
});

function createPlot (context, dimensions) {
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