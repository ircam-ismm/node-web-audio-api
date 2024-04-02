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
  AudioParam,
} = require('./AudioParam.js');
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
  class WaveShaperNode extends AudioNode {

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'WaveShaperNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'WaveShaperNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'WaveShaperNode\': argument 2 is not of type \'WaveShaperOptions\'');
      }

      if (options && 'curve' in options) {
        try {
          parsedOptions.curve = toSanitizedSequence(options.curve, Float32Array);
        } catch (err) {
          throw new TypeError(`Failed to construct 'WaveShaperNode': Failed to read the 'curve' property from WaveShaperOptions: The provided value ${err.message}`);
        }
      } else {
        parsedOptions.curve = null;
      }

      if (options && 'oversample' in options) {
        if (!['none', '2x', '4x'].includes(options.oversample)) {
          throw new TypeError(`Failed to construct 'WaveShaperNode': Failed to read the 'oversample' property from WaveShaperOptions: The provided value '${options.oversample}' is not a valid enum value of type OverSampleType`);
        }

        parsedOptions.oversample = options.oversample;
      } else {
        parsedOptions.oversample = 'none';
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.WaveShaperNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

    }

    get curve() {
      return this[kNapiObj].curve;
    }

    get oversample() {
      return this[kNapiObj].oversample;
    }

    set curve(value) {
      if (!(this instanceof WaveShaperNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'WaveShaperNode\'');
      }

      try {
        this[kNapiObj].curve = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set oversample(value) {
      if (!(this instanceof WaveShaperNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'WaveShaperNode\'');
      }

      try {
        this[kNapiObj].oversample = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  Object.defineProperties(WaveShaperNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(WaveShaperNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'WaveShaperNode',
    },

    curve: kEnumerableProperty,
    oversample: kEnumerableProperty,

  });

  return WaveShaperNode;
};
