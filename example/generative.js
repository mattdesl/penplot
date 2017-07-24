// Run this with `penplot examples/generative.js --node`

import newArray from 'new-array';

import { PaperSize, Orientation, cmToPixels } from 'penplot';
import * as RND from 'penplot/util/random';

const palettes = [
  [ 'hsl(0, 0%, 90%)', 'hsl(0, 0%, 5%)' ],
  [ 'blue' ]
];

const seed = String(Math.floor(Math.random() * 100000));
console.log('Seed:', seed);
RND.setSeed(seed);

export const orientation = Orientation.PORTRAIT;
export const dimensions = PaperSize.SQUARE_POSTER;

// also set up our pixel size for PNG files
const dpi = 300;
const pixelSize = cmToPixels(dimensions, dpi);
export const outputImageWidth = pixelSize[0];
export const outputImageHeight = pixelSize[1];

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  const lineCount = 300;
  const segments = 800;

  const corePalette = palettes[0];
  const altPalette = palettes[1];

  const lines = newArray(lineCount).map((_, j) => {
    const radius = 0;
    const angleOffset = RND.randomFloat(-Math.PI * 2, Math.PI * 2);
    const angleScale = RND.randomFloat(0.001, 1);
    const pal = (RND.randomFloat(1) > 0.9) ? altPalette : corePalette;

    return {
      lineWidth: RND.randomFloat(1) > 0.25 ? RND.randomFloat(0.01, 0.1) : RND.randomFloat(0.1, 1),
      color: pal[RND.randomInt(pal.length)],
      points: newArray(segments).map((_, i) => {
        const t = i / (segments - 1);
        const angle = (Math.PI * 2 * t + angleOffset) * angleScale;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        const offset = j * (0.2 + RND.randomFloat(-1, RND.randomFloat(0, 3)) * 0.1) * 1.5;
        const r = radius + offset;
        const point = [ x * r + width / 2, y * r + height / 2 ];
        const f = 1;
        const amp = 0.5;
        point[0] += RND.noise2D(f * point[0], f * point[1], f * 1000) * amp;
        point[1] += RND.noise2D(f * point[0], f * point[1], f * -1000) * amp;
        return point;
      })
    };
  });

  return {
    draw,
    clear: true,
    background: 'white'
  };

  function draw () {
    context.globalCompositeOperation = 'source-over';
    lines.forEach(line => {
      context.beginPath();
      context.globalAlpha = 0.5;
      context.lineWidth = line.lineWidth;
      context.lineJoin = 'bevel';
      context.lineCap = 'square';
      context.strokeStyle = line.color;
      line.points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });
  }
}
