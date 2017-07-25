export default function createCanvas (width = 300, height = 150) {
  let canvas;
  try {
    const Canvas = require('canvas');
    return canvas = new Canvas(width, height);
  } catch (err) {
    console.error(err.message);
    console.error('Could not install "canvas" module for use with --node option.');
    process.exit(1);
  }
}
