import penplot, { PaperSize, Orientation } from 'penplot';

export default penplot(createPlot, {
  dimensions: PaperSize.LETTER,
  orientation: Orientation.LANDSCAPE
});

function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  return {
    draw,
    animate: false,
    clear: true
  };

  function draw (dt = 0) {
    
  }
}