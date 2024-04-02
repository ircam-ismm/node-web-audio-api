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
  class MediaStreamAudioSourceNode extends AudioNode {

    constructor(context, options) {

      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'MediaStreamAudioSourceNode': 2 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.AudioContext)) {
        throw new TypeError(`Failed to construct 'MediaStreamAudioSourceNode': argument 1 is not of type AudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'MediaStreamAudioSourceNode\': argument 2 is not of type \'MediaStreamAudioSourceOptions\'');
      }

      // required options
      if (typeof options !== 'object' || (options && !('mediaStream' in options))) {
        throw new TypeError('Failed to construct \'MediaStreamAudioSourceNode\': Failed to read the \'mediaStream\'\' property from MediaStreamAudioSourceOptions: Required member is undefined');
      }

      parsedOptions.mediaStream = options.mediaStream;

      let napiObj;

      try {
        napiObj = new nativeBinding.MediaStreamAudioSourceNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

    }

    get mediaStream() {
      return this[kNapiObj].mediaStream;
    }

  }

  Object.defineProperties(MediaStreamAudioSourceNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 2,
    },
  });

  Object.defineProperties(MediaStreamAudioSourceNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'MediaStreamAudioSourceNode',
    },

    mediaStream: kEnumerableProperty,

  });

  return MediaStreamAudioSourceNode;
};
