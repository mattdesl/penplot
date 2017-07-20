require('loud-rejection')();

const chalk = require('chalk');
const assign = require('object-assign');
const budo = require('budo');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1')
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const createClientTransform = require('./client-transform');
const createEnvify = require('envify/custom');

const babelify = require('./babelify');
const installify = require('installify');
const envify = require('loose-envify');
const downloadsFolder = require('downloads-folder');
const unreachableBranch = require('unreachable-branch-transform');

module.exports = dev
function dev (args, argv, entries) {
  const cwd = process.cwd();
  let printOutputFolder;
  let isDownloads = false;
  if (argv.output) {
    printOutputFolder = argv.output;
  } else {
    isDownloads = true;
    printOutputFolder = downloadsFolder();
  }

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
    const entryName = entries[0];
    const entryFile = path.resolve(cwd, entries[0])
    const opts = {
      output: argv.output
    }
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
      getFile('svg', file => svg(file, req, res));
    } else if (req.url === '/save') {
      getFile('png', file => png(file, req, res));
    } else {
      next();
    }
  }

  function composeFile (name, extension, number) {
    return (number === 0 ? name : `${name} (${number})`) + `.${extension}`;
  }

  function getFile (extension, cb) {
    fs.readdir(printOutputFolder, (err, files) => {
      if (err) {
        console.error(chalk.yellow(`‣ WARN`), 'Could not read folder:', chalk.bold(printOutputFolder));
        console.error(err);
        cb(path.resolve(printOutputFolder, uuid() + `.${extension}`));
      } else {
        const type = extension === 'svg' ? 'Plot' : 'Render';
        const date = moment().format('YYYY-MM-DD [at] h.mm.ss A');
        let name = `${type} - ${date}`;
        let number = 0;
        while (true) {
          let test = composeFile(name, extension, number);
          if (files.indexOf(test) >= 0) {
            // file already exists
            number++;
          } else {
            break;
          }
        }
        const fileName = composeFile(name, extension, number);
        cb(path.resolve(printOutputFolder, fileName));
      }
    });
  }

  function getDisplayPath (filePath) {
    return isDownloads ? filePath : path.relative(cwd, filePath);
  }

  function svg (filePath, req, res) {
    if (!req.body || !req.body.svg) {
      res.writeHead(400, 'missing SVG in print()');
      res.end;
    }
    fs.writeFile(filePath, req.body.svg, function (err) {
      if (err) {
        console.error(err);
        res.writeHead(400, err.message);
        return res.end();
      }
      console.log(chalk.cyan(`‣ Saved SVG print to:`), chalk.bold(getDisplayPath(filePath)));
      res.writeHead(200, 'ok');
      res.end();
    });
  }

  function png (filePath, req, res) {
    if (!req.body || !req.body.data) {
      res.writeHead(400, 'missing base64 data for save function');
      res.end;
    }
    const data = Buffer.from(req.body.data, 'base64');
    fs.writeFile(filePath, data, function (err) {
      if (err) {
        console.error(err);
        res.writeHead(400, err.message);
        return res.end();
      }
      console.log(chalk.cyan(`‣ Saved PNG canvas to:`), chalk.bold(getDisplayPath(filePath)));
      res.writeHead(200, 'ok');
      res.end();
    });
  }
}