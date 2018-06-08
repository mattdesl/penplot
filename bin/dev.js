require('loud-rejection')();

const assign = require('object-assign');
const budo = require('budo');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const createClientTransform = require('./client-transform');
const createEnvify = require('envify/custom');

const babelify = require('./babelify');
const installify = require('installify');
const unreachableBranch = require('unreachable-branch-transform');
const createFileSaver = require('./file-saver');

module.exports = dev;
function dev (args, argv, entries) {
  const cwd = process.cwd();
  const fileSaver = createFileSaver({
    output: argv.output,
    cwd: cwd
  });

  const envVars = {};
  const isNode = argv.node;
  if (isNode) {
    process.env.IS_NODE = envVars.IS_NODE = '1';
  }

  if (isNode) {
    require('babel-register')(babelify.getOptions());
    if (entries.length > 1 || entries.length === 0) {
      throw new Error('The --node option only supports a single entry right now.');
    }

    const isStdout = argv.stdout;
    const entryName = entries[0];
    const entryFile = path.resolve(cwd, entries[0]);
    const opts = {
      onComplete: (context) => {
        const runSave = stream => {
          context.canvas.pngStream().pipe(stream);
        };

        if (isStdout) {
          runSave(process.stdout);
        } else {
          fileSaver.getFile('png', (filePath) => {
            const outStream = fs.createWriteStream(filePath);
            outStream.on('close', () => {
              fileSaver.printDisplayPath(filePath);
            });
            runSave(outStream);
          });
        }
      }
    };
    require('../lib/node-client.js')(entryName, entryFile, opts);
  } else {
    // replace entry with our own client
    const clientEntry = path.resolve(__dirname, '../lib/browser-client.js');
    argv._ = [ clientEntry ];

    const generateClient = createClientTransform(clientEntry, entries);
    const transforms = [
      generateClient,
      babelify.getTransform(),
      createEnvify(envVars),
      unreachableBranch
    ];

    if (argv['auto-install']) {
      transforms.push([ installify, { save: true } ]);
    }

    const opts = assign({}, argv, {
      title: 'penplot',
      live: true,
      pushstate: true,
      base: '/',
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

    budo.cli(args, opts);
  }

  function middleware (req, res, next) {
    if (req.url === '/print') {
      fileSaver.getFile('svg', file => svg(file, req, res));
    } else if (req.url === '/save') {
      fileSaver.getFile('png', file => png(file, req, res));
    } else {
      next();
    }
  }

  function svg (filePath, req, res) {
    if (!req.body || !req.body.svg) {
      res.writeHead(400, 'missing SVG in print()');
      res.end();
    }
    fs.writeFile(filePath, req.body.svg, function (err) {
      if (err) {
        console.error(err);
        res.writeHead(400, err.message);
        return res.end();
      }
      fileSaver.printDisplayPath(filePath);
      res.writeHead(200, 'ok');
      res.end();
    });
  }

  function png (filePath, req, res) {
    if (!req.body || !req.body.data) {
      res.writeHead(400, 'missing base64 data for save function');
      res.end();
    }
    const data = Buffer.from(req.body.data, 'base64');
    fs.writeFile(filePath, data, function (err) {
      if (err) {
        console.error(err);
        res.writeHead(400, err.message);
        return res.end();
      }
      fileSaver.printDisplayPath(filePath);
      res.writeHead(200, 'ok');
      res.end();
    });
  }
}
