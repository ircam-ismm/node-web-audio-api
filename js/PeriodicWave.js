const conversions = require('webidl-conversions');

const { throwSanitizedError } = require('./lib/errors.js');
const { toSanitizedSequence } = require('./lib/cast.js');
const { kNapiObj } = require('./lib/symbols.js');
const { kHiddenProperty } = require('./lib/utils.js');

module.exports = (jsExport, nativeBinding) => {
  class PeriodicWave {
    constructor(context, options) {
      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'PeriodicWave': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'PeriodicWave': argument 1 is not of type BaseAudioContext`);
      }

      const parsedOptions = {};

      if (options && 'real' in options) {
        try {
          parsedOptions.real = toSanitizedSequence(options.real, Float32Array);
        } catch (err) {
          throw new TypeError(`Failed to construct 'PeriodicWave': Failed to read the 'real' property from PeriodicWaveOptions: The provided value ${err.message}`);
        }
      }

      if (options && 'imag' in options) {
        try {
          parsedOptions.imag = toSanitizedSequence(options.imag, Float32Array);
        } catch (err) {
          throw new TypeError(`Failed to construct 'PeriodicWave': Failed to read the 'imag' property from PeriodicWaveOptions: The provided value ${err.message}`);
        }
      }

      // disableNormalization = false
      if (options && 'disableNormalization' in options) {
        parsedOptions.disableNormalization = conversions['boolean'](options.disableNormalization, {
          context: `Failed to construct 'PeriodicWave': Failed to read the 'imag' property from PeriodicWaveOptions: The provided value`,
        });
      } else {
        parsedOptions.disableNormalization;
      }

      try {
        const napiObj = new nativeBinding.PeriodicWave(context[kNapiObj], parsedOptions);
        Object.defineProperty(this, kNapiObj, {
          value: napiObj,
          ...kHiddenProperty,
        });
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  Object.defineProperties(PeriodicWave, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(PeriodicWave.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'PeriodicWave',
    },
  });

  return PeriodicWave;
};

