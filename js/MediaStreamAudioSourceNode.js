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
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  AudioParam,
} = require('./AudioParam.js');
const {
  kNativeAudioBuffer,
  kAudioBuffer,
} = require('./AudioBuffer.js');
/* eslint-enable no-unused-vars */

const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');

module.exports = (NativeMediaStreamAudioSourceNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeMediaStreamAudioSourceNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class MediaStreamAudioSourceNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'MediaStreamAudioSourceNode': 2 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext)) {
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

      super(context, parsedOptions);

    }

    get mediaStream() {
      return super.mediaStream;
    }

  }

  return MediaStreamAudioSourceNode;
};
