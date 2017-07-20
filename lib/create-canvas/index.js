export default function createCanvas () {
  let canvas;
  try {
    const Canvas = require('canvas');
    return canvas = new Canvas();
  } catch (err) {
    console.error(err.message);
    console.error('Could not install "canvas" module for use with --node option.');
    process.exit(1);
  }
}
