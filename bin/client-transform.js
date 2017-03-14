const through = require('through2');
const path = require('path');
const fs = require('fs');
const maxstache = require('maxstache');

module.exports = function clientTransform (clientEntry, entries) {
  const cwd = process.cwd();

  return function (file) {
    if (path.resolve(file) === clientEntry) {
      return through(undefined, end);
    } else {
      return through();
    }
  }

  function end () {
    const src = maxstache(fs.readFileSync(clientEntry, 'utf8'), {
      entry: generateEntryCode()
    });

    this.push(src);
    this.push(null);
  }

  function generateEntryCode () {
    const values = entries.map(entry => {
      const fileName = path.basename(entry, path.extname(entry));
      const filePath = path.relative(cwd, entry);
      const name = path.join(path.dirname(filePath), fileName);
      const file = path.resolve(entry);
      return `  ${JSON.stringify(name)}: require(${JSON.stringify(file)})`;
    }).join(',\n');
    
    return `const entries = {\n${values}\n};`;
  }
}
