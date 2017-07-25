/*
  This is an example of how to format your module if
  you prefer to use CommonJS.
*/

const { PaperSize, Orientation } = require('penplot');

module.exports = function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;

  return {
    draw,
    animate: false,
    clear: true
  };

  function draw (dt = 0) {
    context.fillRect(0, 0, width / 2, height / 2);
  }
};

module.exports.dimensions = PaperSize.LETTER;
module.exports.orientation = Orientation.LANDSCAPE;
