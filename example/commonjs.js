// An example of how the module would look with CommonJS
const { PaperSize, Orientation } = require('penplot');

module.exports = function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  return {
    draw,
    animate: false,
    clear: true
  };

  function draw (dt = 0) {
    context.fillRect(0, 0, 3, 3);
  }
};

module.exports.dimensions = PaperSize.LETTER;
module.exports.orientation = Orientation.LANDSCAPE;