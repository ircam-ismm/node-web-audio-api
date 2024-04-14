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
const {
  kNapiObj,
  kAudioBuffer,
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
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'AnalyserNode\': argument 2 is not of type \'AnalyserOptions\'');
      }

      if (options && options.fftSize !== undefined) {
        parsedOptions.fftSize = conversions['unsigned long'](options.fftSize, {
          enforceRange: true,
          context: `Failed to construct 'AnalyserNode': Failed to read the 'fftSize' property from AnalyserOptions: The provided value (${options.fftSize}})`,
        });
      } else {
        parsedOptions.fftSize = 2048;
      }

      if (options && options.maxDecibels !== undefined) {
        parsedOptions.maxDecibels = conversions['double'](options.maxDecibels, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'maxDecibels' property from AnalyserOptions: The provided value (${options.maxDecibels}})`,
        });
      } else {
        parsedOptions.maxDecibels = -30;
      }

      if (options && options.minDecibels !== undefined) {
        parsedOptions.minDecibels = conversions['double'](options.minDecibels, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'minDecibels' property from AnalyserOptions: The provided value (${options.minDecibels}})`,
        });
      } else {
        parsedOptions.minDecibels = -100;
      }

      if (options && options.smoothingTimeConstant !== undefined) {
        parsedOptions.smoothingTimeConstant = conversions['double'](options.smoothingTimeConstant, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'smoothingTimeConstant' property from AnalyserOptions: The provided value (${options.smoothingTimeConstant}})`,
        });
      } else {
        parsedOptions.smoothingTimeConstant = 0.8;
      }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'AnalyserNode': Failed to read the 'channelCount' property from AnalyserOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'channelCount' property from AnalyserOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'channelInterpretation' property from AnalyserOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.AnalyserNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

    }

    get fftSize() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].fftSize;
    }

    set fftSize(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      // @fixme - wpt pretends that when set to -1, this should throw IndexSizeError, not a TypeError.
      // For now let's just cast it to Number without further checks, and let Rust do the job
      // as 0 is an invalid value too
      // value = conversions['unsigned long'](value, {
      //   enforceRange: true,
      //   context: `Failed to set the 'fftSize' property on 'AnalyserNode': Value`
      // });
      value = conversions['unrestricted double'](value, {
        context: `Failed to set the 'fftSize' property on 'AnalyserNode': Value`,
      });

      try {
        this[kNapiObj].fftSize = value;
      } catch (err) {
        throwSanitizedError(err);
      }
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

    set minDecibels(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'minDecibels' property on 'AnalyserNode': Value`,
      });

      try {
        this[kNapiObj].minDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get maxDecibels() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].maxDecibels;
    }

    set maxDecibels(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'maxDecibels' property on 'AnalyserNode': Value`,
      });

      try {
        this[kNapiObj].maxDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get smoothingTimeConstant() {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      return this[kNapiObj].smoothingTimeConstant;
    }

    set smoothingTimeConstant(value) {
      if (!(this instanceof AnalyserNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AnalyserNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'smoothingTimeConstant' property on 'AnalyserNode': Value`,
      });

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
