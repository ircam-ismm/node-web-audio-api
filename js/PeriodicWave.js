const { throwSanitizedError } = require('./lib/errors.js');

module.exports = (NativePeriodicWave) => {
  class PeriodicWave extends NativePeriodicWave {
    constructor(context, options) {
      try {
        super(context, options);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  return PeriodicWave;
};

