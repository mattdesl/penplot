# penplot

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

An experimental and highly opinionated development environment for generative and pen plotter art.

Some features:

- Zero configuration: just run a command and start writing `<canvas>` renderings
- Fast live-reload on file save
- Hotkey for high-quality PNG output
- Hotkey for SVG rendering
- A builtin library of utilities for random numbers, geometry tools, SVG exporting, and other functions
- Easy integration with Inkscape and AxiDraw v3

## Quick Start

You can install this with npm.

```sh
npm install penplot -g
```

Here is a simple command you can use to quick-start a new plot:

```sh
penplot src/index.js --write --open
```

This will write a new `src/index.js` file and open `localhost:9966`. Now start editing your `index.js` file to see the LiveReload in action.

<img src="docs/screenshots/screenshot.png" width="50%" />

While in your browser session, you can hit `Cmd/Ctrl + P` to export the SVG to a file in your Downloads folder, or `Cmd/Ctrl + S` to save a PNG file.

The SVG should be formatted to fit a Letter size paper with a pen plotter like AxiDraw V3.

## More Commands

Here are some commands you can try.

```sh
# stub out a new file called plot.js
penplot plot.js --write

# run plot.js and open the browser
penplot plot.js --open

# set the output folder for SVG/PNG files
penplot plot.js --output=tmp

# generate a PNG with Node.js
penplot plot.js --node

# write PNG to stdout
penplot plot.js --node --stdout > file.png

# write PNG to custom output folder
penplot plot.js --node --output=tmp 
```

## Node.js

You can also use this as a tool for developing algorithmic/generative art. For example, you can develop the artwork in a browser for LiveReload and fast iterations, and when you want to print it you can set the dimensions and output size like so:

```
// desired orientation
export const orientation = Orientation.PORTRAIT;

// desired dimensions in CM (used for aspect ratio)
export const dimensions = PaperSize.LETTER;

// desired pixel output size, i.e. 8.5 in @ 300 DPI
export const outputImageWidth = 2550;

// your artwork
export default function createPlot (context, dimensions) {
  ...
}
```

Then, use the `--node` flag to run the plot with `node-canvas`, assuming none of your code is browser-specific.

```sh
penplot my-plot.js --node --stdout > render.png
```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/penplot/blob/master/LICENSE.md) for details.
