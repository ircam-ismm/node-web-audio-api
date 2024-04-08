// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

/* eslint-disable no-unused-vars */
const conversions = require('webidl-conversions');
const {
  toSanitizedSequence,
} = require('./lib/cast.js');
const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');

const AudioParam = require('./AudioParam.js');
const {
  kNativeAudioBuffer,
  kAudioBuffer,
} = require('./AudioBuffer.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');
const {
  bridgeEventTarget,
} = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class AnalyserNode extends AudioNode {

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'AnalyserNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'AnalyserNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'AnalyserNode\': argument 2 is not of type \'AnalyserOptions\'');
      }

      if (options && 'fftSize' in options) {
        parsedOptions.fftSize = conversions['unsigned long'](options.fftSize, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'fftSize' property from AnalyserOptions: The provided value (${options.fftSize}})`,
        });
      } else {
        parsedOptions.fftSize = 2048;
      }

      if (options && 'maxDecibels' in options) {
        parsedOptions.maxDecibels = conversions['double'](options.maxDecibels, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'maxDecibels' property from AnalyserOptions: The provided value (${options.maxDecibels}})`,
        });
      } else {
        parsedOptions.maxDecibels = -30;
      }

      if (options && 'minDecibels' in options) {
        parsedOptions.minDecibels = conversions['double'](options.minDecibels, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'minDecibels' property from AnalyserOptions: The provided value (${options.minDecibels}})`,
        });
      } else {
        parsedOptions.minDecibels = -100;
      }

      if (options && 'smoothingTimeConstant' in options) {
        parsedOptions.smoothingTimeConstant = conversions['double'](options.smoothingTimeConstant, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'smoothingTimeConstant' property from AnalyserOptions: The provided value (${options.smoothingTimeConstant}})`,
        });
      } else {
        parsedOptions.smoothingTimeConstant = 0.8;
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.AnalyserNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

    }

    get fftSize() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].fftSize;
    }

    get frequencyBinCount() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].frequencyBinCount;
    }

    get minDecibels() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].minDecibels;
    }

    get maxDecibels() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].maxDecibels;
    }

    get smoothingTimeConstant() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].smoothingTimeConstant;
    }

    set fftSize(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      try {
        this[kNapiObj].fftSize = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set minDecibels(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      try {
        this[kNapiObj].minDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set maxDecibels(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      try {
        this[kNapiObj].maxDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set smoothingTimeConstant(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      try {
        this[kNapiObj].smoothingTimeConstant = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getFloatFrequencyData(array) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'getFloatFrequencyData' on 'AnalyserNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(array instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'getFloatFrequencyData' on 'AnalyserNode': Parameter 1 is not of type 'Float32Array'`);
      }

      try {
        return this[kNapiObj].getFloatFrequencyData(array);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getByteFrequencyData(array) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'getByteFrequencyData' on 'AnalyserNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(array instanceof Uint8Array)) {
        throw new TypeError(`Failed to execute 'getByteFrequencyData' on 'AnalyserNode': Parameter 1 is not of type 'Uint8Array'`);
      }

      try {
        return this[kNapiObj].getByteFrequencyData(array);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getFloatTimeDomainData(array) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'getFloatTimeDomainData' on 'AnalyserNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(array instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'getFloatTimeDomainData' on 'AnalyserNode': Parameter 1 is not of type 'Float32Array'`);
      }

      try {
        return this[kNapiObj].getFloatTimeDomainData(array);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getByteTimeDomainData(array) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'getByteTimeDomainData' on 'AnalyserNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(array instanceof Uint8Array)) {
        throw new TypeError(`Failed to execute 'getByteTimeDomainData' on 'AnalyserNode': Parameter 1 is not of type 'Uint8Array'`);
      }

      try {
        return this[kNapiObj].getByteTimeDomainData(array);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  Object.defineProperties(AnalyserNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(AnalyserNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AnalyserNode',
    },

    fftSize: kEnumerableProperty,
    frequencyBinCount: kEnumerableProperty,
    minDecibels: kEnumerableProperty,
    maxDecibels: kEnumerableProperty,
    smoothingTimeConstant: kEnumerableProperty,
    getFloatFrequencyData: kEnumerableProperty,
    getByteFrequencyData: kEnumerableProperty,
    getFloatTimeDomainData: kEnumerableProperty,
    getByteTimeDomainData: kEnumerableProperty,
  });

  return AnalyserNode;
};
