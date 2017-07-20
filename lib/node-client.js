import run from './run-entry';

module.exports = function (name, file, opts) {
  let entry;
  try {
    entry = require(file);
  } catch (err) {
    console.error(err);
    console.error('Could not require file:', name);
    process.exit(1);
  }
  run(name, entry, opts);
};

  
