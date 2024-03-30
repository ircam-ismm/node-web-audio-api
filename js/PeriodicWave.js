const { throwSanitizedError } = require('./lib/errors.js');
const { kNapiObj } = require('./lib/symbols.js');

module.exports = (NativePeriodicWave) => {
  class PeriodicWave extends NativePeriodicWave {
    constructor(context, options) {
      // @todo - check options
      try {
        super(context[kNapiObj], options);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  return PeriodicWave;
};

