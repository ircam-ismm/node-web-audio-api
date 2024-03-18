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

module.exports = (NativeMediaStreamAudioSourceNode) => {
  const EventTarget = EventTargetMixin(NativeMediaStreamAudioSourceNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class MediaStreamAudioSourceNode extends AudioNode {
    constructor(context, options) {
      // keep a handle to the original object, if we need to manipulate the
      // options before passing them to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options !== undefined) {
        if (typeof options !== 'object') {
          throw new TypeError('Failed to construct \'MediaStreamAudioSourceNode\': argument 2 is not of type \'MediaStreamAudioSourceOptions\'');
        }

        if (options && !('mediaStream' in options)) {
          throw new Error('Failed to read the \'mediaStream\'\' property from MediaStreamAudioSourceOptions: Required member is undefined.');
        }

      }

      super(context, parsedOptions);

    }

    get mediaStream() {
      return super.mediaStream;
    }

  }

  return MediaStreamAudioSourceNode;
};
