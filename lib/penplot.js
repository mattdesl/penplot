import createLoop from 'raf-loop';
import defined from 'defined';
import keycode from 'keycode';
import xhr from 'xhr';
import isBuffer from 'is-buffer';
import isPromise from 'is-promise';
import createCanvasImpl from './create-canvas';
import parseUnit from 'parse-unit';
import css from 'dom-css';

const DEFAULT_OUTPUT_WIDTH = 1280;
const noop = () => {};

export const isBrowser = () => process.env.IS_NODE !== '1';

// Can't export an imported function in ES6...?
export const createCanvas = (width = 300, height = 150) => createCanvasImpl(width, height);

export const PaperSize = {
  LETTER: [ 21.59, 27.94 ],
  PORTRAIT: [ 24, 36 ],
  SKETCHBOOK: [ 17.7, 25.4 ],
  SQUARE_POSTER: [ 30, 30 ]
};

export const Orientation = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait'
};

export const Margin = {
  ONE_INCH: [ 2.54, 2.54 ] // 1 in margins
};

export const PenThickness = {
  FINE_TIP: 0.03
};

export default function penplot (createPlot, opt = {}) {
  const deprecations = checkDeprecations();

  const displayPadding = defined(opt.displayPadding, 40);

  const canvas = createCanvasImpl();
  const context = canvas.getContext('2d');

  if (isBrowser() && typeof document !== 'undefined') {
    document.body.appendChild(canvas);
    document.body.style.margin = '0';
    css(canvas, {
      display: 'none',
      position: 'absolute',
      'box-shadow': '3px 3px 20px 0px rgba(0, 0, 0, 0.15)',
      'box-sizing': 'border-box'
    });
  }

  let canvasWidth, canvasHeight;
  let pixelRatio = 1;

  if (opt.orientation && typeof opt.orientation !== 'string') {
    throw new TypeError('opt.orientaiton must be a string or Orientation constant, "landscape" or "portrait"');
  }
  if (opt.dimensions && !Array.isArray(opt.dimensions)) {
    throw new TypeError('opt.dimensions must be an array or PaperSize constant, e.g. [ 25, 12 ]');
  }

  const orientation = opt.orientation || Orientation.PORTRAIT;
  const dimensions = orient(opt.dimensions || PaperSize.LETTER, orientation);
  const aspect = dimensions[0] / dimensions[1];

  const result = createPlot(context, dimensions);
  if (!result) throw new TypeError('penplot function must return a valid object');

  let plot, lineWidth;
  if (isPromise(result)) {
    result.then(plotResult => {
      plot = plotResult;
      setup();
    });
  } else {
    plot = result;
    setup();
  }

  function setup () {
    lineWidth = defined(plot.lineWidth, PenThickness.FINE_TIP);

    if (isBrowser()) {
      window.addEventListener('resize', () => {
        resize();
        draw();
      });
      window.addEventListener('keydown', ev => {
        const key = keycode(ev);
        const cmdOrCtrl = ev.ctrlKey || ev.metaKey;
        if (cmdOrCtrl && key === 'p') {
          ev.preventDefault();
          print();
        } else if (cmdOrCtrl && key === 's') {
          ev.preventDefault();
          save();
        }
      });
    }

    if (isBrowser()) {
      canvas.style.display = 'block';
    }
    resize();
    clear();

    const onComplete = typeof opt.onComplete === 'function' ? opt.onComplete : noop;
    if (!isBrowser()) {
      setToOutputSize();
      draw();
      onComplete(context);
    } else {
      draw(); // first render
      if (plot.animate) { // keep rendering with rAF
        createLoop(draw).start();
      }
      onComplete(context);
      window.focus();
    }
  }

  function clear () {
    if (plot.background) {
      context.save();
      context.globalAlpha = 1;
      context.fillStyle = plot.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function orient (dimensions, orientation) {
    return orientation === Orientation.LANDSCAPE
      ? dimensions.slice().reverse()
      : dimensions.slice();
  }

  function draw (dt = 0) {
    context.save();

    if (plot.clear !== false) {
      clear();
    }

    context.scale(
      pixelRatio * (canvasWidth / dimensions[0]),
      pixelRatio * (canvasHeight / dimensions[1])
    );

    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.globalAlpha = 1;
    context.lineWidth = lineWidth;
    context.fillStyle = 'black';
    context.strokeStyle = 'black';

    plot.draw(dt);
    context.restore();
  }

  function resize () {
    if (!isBrowser()) {
      setToOutputSize();
    } else {
      // browser size for display
      pixelRatio = window.devicePixelRatio;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let width, height;
      if (windowWidth > windowHeight) {
        height = windowHeight - displayPadding * 2;
        width = height * aspect;
      } else {
        width = windowWidth - displayPadding * 2;
        height = width / aspect;
      }

      const left = Math.floor((windowWidth - width) / 2);
      const top = Math.floor((windowHeight - height) / 2);
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.left = `${left}px`;
      canvas.style.top = `${top}px`;
      canvasWidth = width;
      canvasHeight = height;
    }
  }

  function setToOutputSize () {
    const outputSize = getOutputSize();
    const width = outputSize[0];
    const height = outputSize[1];
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    canvasWidth = width;
    canvasHeight = height;
    pixelRatio = 1;
  }

  function getOutputSize (desiredSize) {
    let outputSize = deprecations.outputSize
      ? [ opt.outputImageWidth, opt.outputImageHeight ]
      : (plot.outputSize || [ DEFAULT_OUTPUT_WIDTH, null ]);

    if (typeof outputSize === 'string') {
      const parsed = parseUnit(outputSize);
      if (/^dpi$/i.test(parsed[1])) {
        outputSize = cmToPixels(dimensions, parsed[0]);
      } else {
        throw new Error('Invalid value for outputSize - expected number, array or "X dpi" string');
      }
    }

    // single value -> [ width, 'auto' ]
    if (typeof outputSize === 'number') {
      outputSize = [ outputSize, null ];
    }

    const hasWidth = hasDimension(outputSize[0]);
    const hasHeight = hasDimension(outputSize[1]);

    let newWidth, newHeight;

    // if width is defined and height is not, compute height automatically
    // if height is defined and width is not, compute width automatically
    // if neither are defined, use default width & compute height automatically
    // if both are defined, use both
    if ((hasWidth && !hasHeight) || (!hasWidth && !hasHeight)) {
      newWidth = hasWidth ? outputSize[0] : DEFAULT_OUTPUT_WIDTH;
      newHeight = newWidth / aspect;
    } else if (hasHeight && !hasWidth) {
      newHeight = outputSize[1];
      newWidth = newHeight * aspect;
    } else if (hasWidth && hasHeight) {
      newWidth = outputSize[0];
      newHeight = outputSize[1];
    } else {
      throw new Error('wtf')
    }

    // to whole pixels
    newWidth = Math.floor(newWidth);
    newHeight = Math.floor(newHeight);
    return [ newWidth, newHeight ];
  }

  function hasDimension (n) {
    return typeof n === 'number' && n >= 0;
  }

  function save () {
    // capture frame at a larger resolution
    setToOutputSize();
    draw();

    if (isBrowser()) {
      const base64 = canvas.toDataURL().slice('data:image/png;base64,'.length);

      // resize back to original resolution
      resize();
      draw();

      if (process.env.NODE_ENV !== 'production') {
        xhr.post('/save', {
          json: true,
          body: {
            data: base64
          }
        }, err => {
          if (err) throw err;
        });
      } else {
        console.warn('Not yet implemented: save canvas to PNG in client-side / production.');
      }
    }
  }

  function print () {
    if (process.env.NODE_ENV === 'production') {
      console.log('You need to be in development mode to print a plot!');
    } else if (typeof plot.print !== 'function') {
      throw new Error('Plot has no print() function defined!');
    } else {
      const svg = plot.print();
      if (!svg || (!isBuffer(svg) && typeof svg !== 'string')) {
        throw new Error('print() must return a string or Buffer SVG file!');
      }
      xhr.post('/print', {
        json: true,
        body: {
          dimensions,
          orientation,
          lineWidth,
          svg
        }
      }, err => {
        if (err) throw err;
      });
    }
  }

  function checkDeprecations () {
    let result = {};
    if (typeof opt.outputImageWidth === 'number' || typeof opt.outputImageHeight === 'number') {
      console.warn('[penplot] Deprecation notice - outputImageWidth/Height has been moved to the options returned from your penplot function.');
      result.outputSize = true;
    }
    return result;
  }
}

export function cmToPixels (dimensions, dpi = 300) {
  const CM_IN = 2.54;
  if (Array.isArray(dimensions)) {
    const inchWidth = dimensions[0] / CM_IN;
    const inchHeight = dimensions[1] / CM_IN;
    return [ inchWidth * dpi, inchHeight * dpi ];
  } else {
    return (dimensions / CM_IN) * dpi;
  }
}
