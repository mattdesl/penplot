/*
  This is a more advanced example of a generative/algorithmic
  print created with `penplot` and Canvas2D. It mostly consists of
  concentric circles with different arc lengths and a lot of
  random offsets.
*/

import newArray from 'new-array';
import clamp from 'clamp';
import { PaperSize, Orientation } from 'penplot';
import * as RND from 'penplot/util/random';
import allPalettes from 'nice-color-palettes/500';
import colorConvert from 'color-convert';
import fromCSS from 'css-color-converter';

// often it's handy to mark down a nice seed so you can re-print it later
// at a different size
const seed = '42032';

// other times you may want to idly browse through random seeds
// const seed = String(Math.floor(Math.random() * 100000));

// check the console for the seed number :)
console.log('Seed:', seed);

RND.setSeed(seed);

const palettes = [
  [ 'hsl(0, 0%, 85%)', 'hsl(0, 0%, 95%)' ],
  RND.shuffle(RND.shuffle(allPalettes)[0]).slice(0, 3)
];

export const orientation = Orientation.PORTRAIT;
export const dimensions = PaperSize.SKETCHBOOK;

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  const lineCount = 300;
  const segments = 2000;

  const corePalette = palettes[0];
  const altPalette = palettes[1];
  const allPoints = [];

  const lines = newArray(lineCount).map((_, j) => {
    const radius = 0;
    const angleOffset = RND.randomFloat(-Math.PI * 2, Math.PI * 2);
    const angleScale = RND.randomFloat(0.01, 0.01);
    const pal = (RND.randomFloat(1) > 0.75) ? altPalette : corePalette;

    const startColor = pal[RND.randomInt(pal.length)];
    const hsl = colorConvert.hex.hsl(fromCSS(startColor).toHexString().replace(/^#/, ''));
    const color = startColor;

    // only modify the color palettes
    const isHSLMod = pal === altPalette;

    return {
      lineWidth: RND.randomFloat(1) > 0.25 ? RND.randomFloat(0.01, 0.05) : RND.randomFloat(0.01, 4),
      color,
      hsl,
      isHSLMod,
      alpha: RND.randomFloat(0.15, 0.75),
      points: newArray(segments).map((_, i) => {
        const t = i / (segments - 1);
        const K = j / (lineCount - 1);
        const angleOff = RND.noise2D(K * 1, t * 200) * 0.1;
        const angle = (Math.PI * 2 * t) * angleScale + angleOff + angleOffset;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        const offset = j * (0.2 + RND.randomFloat(-1, RND.randomFloat(0, 5)) * 0.1) * 0.5;
        const r = radius + offset;
        const center = RND.randomCircle([], 0.01)
        const point = [ x * r + width / 2 + center[0], y * r + height / 2 + center[1] ];
        const f = 10;
        const amp = 0.005;
        point[0] += RND.noise2D(f * point[0], f * point[1], f * 1000) * amp;
        point[1] += RND.noise2D(f * point[0], f * point[1], f * -1000) * amp;

        const newColor = isHSLMod
          ? `#${colorConvert.hsl.hex(offsetLightness(hsl, RND.randomFloat(-1, 1) * 10))}`
          : startColor;
        allPoints.push(point);
        return {
          position: point,
          color: newColor
        };
      })
    };
  });

  return {
    draw,
    outputSize: '300 dpi', // render as print resolution instead of web
    background: corePalette[0]
  };

  function offsetLightness (hsl, l) {
    hsl = hsl.slice();
    hsl[2] += l;
    hsl[2] = clamp(hsl[2], 0, 100);
    return hsl;
  }

  function draw () {
    lines.forEach(line => {
      // render each line as small segments so we get overlapping
      // opacities
      for (let i = 0; i < line.points.length / 2; i++) {
        context.beginPath();
        context.globalAlpha = line.alpha;
        context.lineWidth = line.lineWidth;
        context.lineJoin = 'round';
        context.lineCap = 'square';
        context.strokeStyle = line.points[i * 2 + 0].color;
        const [ x1, y1 ] = line.points[i * 2 + 0].position;
        const [ x2, y2 ] = line.points[i * 2 + 1].position;
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      }
    });
  }
}
