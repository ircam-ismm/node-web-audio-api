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
  class ConvolverNode extends AudioNode {

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'ConvolverNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'ConvolverNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'ConvolverNode\': argument 2 is not of type \'ConvolverOptions\'');
      }

      if (options && 'buffer' in options) {
        if (options.buffer !== null) {
          // if (!(kNativeAudioBuffer in options.buffer)) {
          if (!(options.buffer instanceof jsExport.AudioBuffer)) {
            throw new TypeError('Failed to construct \'ConvolverNode\': Failed to read the \'buffer\' property from ConvolverOptions: The provided value cannot be converted to \'AudioBuffer\'');
          }

          // unwrap napi audio buffer
          parsedOptions.buffer = options.buffer[kNativeAudioBuffer];
        }
      } else {
        parsedOptions.buffer = null;
      }

      if (options && 'disableNormalization' in options) {
        parsedOptions.disableNormalization = conversions['boolean'](options.disableNormalization, {
          context: `Failed to construct 'ConvolverNode': Failed to read the 'disableNormalization' property from ConvolverOptions: The provided value (${options.disableNormalization}})`,
        });
      } else {
        parsedOptions.disableNormalization = false;
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.ConvolverNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

      // keep the wrapped AudioBuffer around
      this[kAudioBuffer] = null;

      if (options && 'buffer' in options) {
        this[kAudioBuffer] = options.buffer;
      }

    }

    get buffer() {
      return this[kAudioBuffer];
    }

    get normalize() {
      return this[kNapiObj].normalize;
    }

    // @todo - should be able to set to null afterward
    set buffer(value) {
      if (!(this instanceof ConvolverNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConvolverNode\'');
      }

      if (value === null) {
        return;
      } else if (!(kNativeAudioBuffer in value)) {
        throw new TypeError('Failed to set the \'buffer\' property on \'AudioBufferSourceNode\': Failed to convert value to \'AudioBuffer\'');
      }

      try {
        this[kNapiObj].buffer = value[kNativeAudioBuffer];
      } catch (err) {
        throwSanitizedError(err);
      }

      this[kAudioBuffer] = value;
    }

    set normalize(value) {
      if (!(this instanceof ConvolverNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConvolverNode\'');
      }

      try {
        this[kNapiObj].normalize = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  Object.defineProperties(ConvolverNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'ConvolverNode',
    },

    buffer: kEnumerableProperty,
    normalize: kEnumerableProperty,

  });

  return ConvolverNode;
};
