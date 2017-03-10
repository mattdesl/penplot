// Expose penplot as a require so it matches the CLI version
// and the user doesn't need to npm install it locally.
const builtins = [
  'penplot',
  'penplot/constants',
  'penplot/random',
  'penplot/svg'
];

module.exports = function (bundler) {
  builtins.forEach(key => {
    const id = key.replace('penplot', '..').replace(/\.$/, './');
    bundler.require(require.resolve(id), { expose: key });
  });
}