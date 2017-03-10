#!/usr/bin/env node
const args = process.argv.slice(2);
const argv = require('budo/lib/parse-args')(args);
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const mkdirp = require('mkdirp');

const entry = argv._[0];

if (!entry) {
  console.error(chalk.red('‣ ERROR'), 'You must specify a file path:')
  console.error(chalk.dim('    penplot myplot.js'));
  process.exit(1);
}

// if the file doesn't exist, stub it out
isFile(entry, exists => {
  if (exists) {
    start();
  } else if (argv.write) {
    console.log(chalk.cyan(`‣ Writing plot file to:`), chalk.bold(entry));
    const dir = path.dirname(entry);
    mkdirp(dir, err => {
      if (err) throw err;
      const template = fs.readFileSync(path.resolve(__dirname, 'template.js'));
      fs.writeFile(entry, template, function (err) {
        if (err) throw err;
        start();
      });
    });
  } else {
    console.error(chalk.red('‣ ERROR'), 'File does not exist:', chalk.bold(entry));
    console.error('\nUse --write if you want to stub a new file, for e.g.');
    console.error('    penplot myplot.js --write');
    process.exit(1);
  }
});

function start () {
  // entry for client require()
  process.env.PENPLOT_ENTRY = path.resolve(entry);

  // replace entry with our own client
  const clientEntry = path.resolve(__dirname, '../lib/client.js');
  argv._[0] = clientEntry;

  if (process.env.NODE_ENV !== 'production') {
    require('./dev.js')(args, argv);
  }
}

function isFile (file, cb) {
  fs.stat(file, function (err, stat) {
    if (!err) {
      if (!stat.isFile()) throw new Error(`${file} is not a file!`);
      return cb(true);
    }
    if (err.code === 'ENOENT') {
      cb(false);
    } else {
      throw err;
    }
  })
}
