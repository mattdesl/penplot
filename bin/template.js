import { PaperSize, Orientation } from 'penplot';

export const dimensions = PaperSize.LETTER;
export const orientation = Orientation.LANDSCAPE;

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  return {
    draw,
    animate: false,
    clear: true
  };

  function draw (dt = 0) {
    
  }
}