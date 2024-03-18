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

module.exports = (NativeConvolverNode) => {
  const EventTarget = EventTargetMixin(NativeConvolverNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class ConvolverNode extends AudioNode {
    constructor(context, options) {
      // keep a handle to the original object, if we need to manipulate the
      // options before passing them to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options !== undefined) {
        if (typeof options !== 'object') {
          throw new TypeError('Failed to construct \'ConvolverNode\': argument 2 is not of type \'ConvolverOptions\'');
        }

        if ('buffer' in options) {
          if (options.buffer !== null) {
            if (!(kNativeAudioBuffer in options.buffer)) {
              throw new TypeError('Failed to set the \'buffer\' property on \'AudioBufferSourceNode\': Failed to convert value to \'AudioBuffer\'');
            }

            // unwrap napi audio buffer
            parsedOptions.buffer = options.buffer[kNativeAudioBuffer];
          }
        }

      }

      super(context, parsedOptions);

      // keep the wrapper AudioBuffer wrapperaround
      this[kAudioBuffer] = null;

      if (options && 'buffer' in options) {
        this[kAudioBuffer] = options.buffer;
      }

    }

    get buffer() {
      return this[kAudioBuffer];
    }

    get normalize() {
      return super.normalize;
    }

    // @todo - should be able to set to null afterward
    set buffer(value) {
      if (value === null) {
        return;
      } else if (!(kNativeAudioBuffer in value)) {
        throw new TypeError('Failed to set the \'buffer\' property on \'AudioBufferSourceNode\': Failed to convert value to \'AudioBuffer\'');
      }

      try {
        super.buffer = value[kNativeAudioBuffer];
      } catch (err) {
        throwSanitizedError(err);
      }

      this[kAudioBuffer] = value;
    }

    set normalize(value) {
      try {
        super.normalize = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return ConvolverNode;
};
