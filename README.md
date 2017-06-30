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

## Outputs

## Usage

You can install this with npm.

```sh
npm install penplot -g
```

Then, run it any time like so:

```sh
penplot src/index.js --open
```

This will open `localhost:9966`, and you can start editing the `basic.js` script. While in your browser session, push `Cmd/Ctrl + P` to export the SVG to a file in your Downloads folder.


## License

MIT, see [LICENSE.md](http://github.com/mattdesl/penplot/blob/master/LICENSE.md) for details.
