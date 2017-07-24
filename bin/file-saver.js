const downloadsFolder = require('downloads-folder');
const uuid = require('uuid/v1');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');

module.exports = function createFileSaver (opt) {
  const cwd = opt.cwd || process.cwd();
  let printOutputFolder;
  let isDownloads = false;
  if (opt.output) {
    printOutputFolder = opt.output;
  } else {
    isDownloads = true;
    printOutputFolder = downloadsFolder();
  }

  return {
    getFile: getFile,
    printDisplayPath: printDisplayPath,
    getDisplayPath: getDisplayPath
  };

  function printDisplayPath (filePath) {
    const ext = path.extname(filePath).replace(/^\./, '').toUpperCase();
    console.log(chalk.cyan(`‣ Saved ${ext} print to:`), chalk.bold(getDisplayPath(filePath)));
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
}