const fs = require('fs');
const path = require('path');

const alias = {
  penplot: require.resolve('../')
};

// Add in all the utils
const utilFolder = path.resolve(__dirname, '../util');
const files = fs.readdirSync(utilFolder)
  .filter(f => /\.js(on)?$/i.test(f))
  .map(file => {
    const ext = /\.json$/i.test(file) ? undefined : path.extname(file);
    const name = path.basename(file, ext);
    const filePath = path.resolve(utilFolder, file);
    return {
      name: `penplot/util/${name}`,
      filePath: filePath
    };
  });

files.forEach(file => {
  alias[file.name] = file.filePath;
});

module.exports = require('babelify').configure({
  presets: [ require.resolve('babel-preset-es2015') ],
  plugins: [
    [ require.resolve('babel-plugin-module-resolver'), {
      alias
    } ]
  ]
});