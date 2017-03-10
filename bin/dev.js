require('loud-rejection')();
const assign = require('object-assign');
const budo = require('budo');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1')
const path = require('path');
const fs = require('fs');
const babelify = require('babelify').configure({
  presets: [ 'es2015' ]
});
const envify = require('loose-envify');
const downloadsFolder = require('downloads-folder');
 
const printOutputFolder = downloadsFolder();

module.exports = dev
function dev (args, argv) {
  const transforms = [
    babelify,
    [ envify, { global: true } ]
  ];

  const opts = assign({
    title: 'penplot'
  }, argv, {
    live: true,
    browserify: {
      transform: transforms
    },
    middleware: [
      bodyParser.json({
        limit: '1gb'
      }),
      middleware
    ],
    serve: 'bundle.js'
  });
  const app = budo.cli(args, opts);
  app.on('connect', () => {
    console.log('connected')
  });
  return app;

  function middleware (req, res, next) {
    if (req.url === '/print') {
      const fileName = uuid() + '.svg';
      const filePath = path.resolve(printOutputFolder, fileName);
      if (!req.body || !req.body.svg) {
        res.writeHead(400, 'missing SVG in print()');
        res.end;
      }
      fs.writeFile(filePath, req.body.svg, function (err) {
        if (err) throw err;
        res.writeHead(200, 'ok');
        res.end();
      });
    } else {
      next();
    }
  }
}