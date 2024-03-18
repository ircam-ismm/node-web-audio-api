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
const AudioScheduledSourceNodeMixin = require('./AudioScheduledSourceNode.mixin.js');

module.exports = (NativeAudioBufferSourceNode) => {
  const EventTarget = EventTargetMixin(NativeAudioBufferSourceNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);
  const AudioScheduledSourceNode = AudioScheduledSourceNodeMixin(AudioNode);

  class AudioBufferSourceNode extends AudioScheduledSourceNode {
    constructor(context, options) {
      // keep a handle to the original object, if we need to manipulate the
      // options before passing them to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options !== undefined) {
        if (typeof options !== 'object') {
          throw new TypeError('Failed to construct \'AudioBufferSourceNode\': argument 2 is not of type \'AudioBufferSourceOptions\'');
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

      // EventTargetMixin constructor has been called so EventTargetMixin[kDispatchEvent]
      // is bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();

      this.playbackRate = new AudioParam(this.playbackRate);
      this.detune = new AudioParam(this.detune);
    }

    get buffer() {
      return this[kAudioBuffer];
    }

    get loop() {
      return super.loop;
    }

    get loopStart() {
      return super.loopStart;
    }

    get loopEnd() {
      return super.loopEnd;
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

    set loop(value) {
      try {
        super.loop = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set loopStart(value) {
      try {
        super.loopStart = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set loopEnd(value) {
      try {
        super.loopEnd = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return AudioBufferSourceNode;
};
