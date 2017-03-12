import defined from 'defined';

const TO_PX = 35.43307;
const DEFAULT_SVG_LINE_WIDTH = 0.03;

export function polylinesToSVG (polylines, opt = {}) {
  const dimensions = opt.dimensions;
  if (!dimensions) throw new TypeError('must specify dimensions currently');
  const decimalPlaces = 5;

  let commands = [];
  polylines.forEach(line => {
    line.forEach((point, j) => {
      const type = (j === 0) ? 'M' : 'L';
      const x = (TO_PX * point[0]).toFixed(decimalPlaces);
      const y = (TO_PX * point[1]).toFixed(decimalPlaces);
      commands.push(`${type} ${x} ${y}`);
    });
  });

  const svgPath = commands.join(' ');
  const viewWidth = (dimensions[0] * TO_PX).toFixed(decimalPlaces);
  const viewHeight = (dimensions[1] * TO_PX).toFixed(decimalPlaces);
  const fillStyle = opt.fillStyle || 'none';
  const strokeStyle = opt.strokeStyle || 'black';
  const lineWidth = defined(opt.lineWidth, DEFAULT_SVG_LINE_WIDTH);
  
  return `<?xml version="1.0" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" 
    "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  <svg width="${dimensions[0]}cm" height="${dimensions[1]}cm"
       xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${viewWidth} ${viewHeight}">
   <g>
     <path d="${svgPath}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}cm" />
   </g>
</svg>`;
}
  