import penplot from 'penplot';

export default function run (name, result, options) {
  options = options || {};
  if (!result) throw new Error(`Module ${name} does not export anything!`);
  if (result.__esModule) {
    // assume ES2015
    if (!result.default) {
      throw new Error(`Malformed penplot function in ${name}\nES2015 modules must export a default function.`);
    }
    const opts = Object.assign({}, result, options);
    delete opts.default;
    delete opts.__esModule;
    penplot(result.default, opts);
  } else if (typeof result === 'function') {
    // assume CommonJS
    penplot(result, Object.assign({}, result, options));
  } else {
    throw new Error(`Malformed penplot function in ${name}\nModule must be ` +
      'in ES2015 or CommonJS style and should return a function.');
  }
}