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
const AudioScheduledSourceNodeMixin = require('./AudioScheduledSourceNode.mixin.js');

module.exports = (NativeAudioBufferSourceNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeAudioBufferSourceNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);
  const AudioScheduledSourceNode = AudioScheduledSourceNodeMixin(AudioNode);

  class AudioBufferSourceNode extends AudioScheduledSourceNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'AudioBufferSourceNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'AudioBufferSourceNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'AudioBufferSourceNode\': argument 2 is not of type \'AudioBufferSourceOptions\'');
      }

      if (options && 'buffer' in options) {
        if (options.buffer !== null) {
          // if (!(kNativeAudioBuffer in options.buffer)) {
          if (!(options.buffer instanceof nativeBinding.AudioBuffer)) {
            throw new TypeError(' `Failed to construct \'AudioBufferSourceNode\': Failed to read the \'buffer\' property from AudioBufferSourceOptions: The provided value cannot be converted to \'AudioBuffer\'');
          }

          // unwrap napi audio buffer
          parsedOptions.buffer = options.buffer[kNativeAudioBuffer];
        }
      } else {
        parsedOptions.buffer = null;
      }

      if (options && 'detune' in options) {
        parsedOptions.detune = conversions['float'](options.detune, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'detune' property from AudioBufferSourceOptions: The provided value (${options.detune}})`,
        });
      } else {
        parsedOptions.detune = 0;
      }

      if (options && 'loop' in options) {
        parsedOptions.loop = conversions['boolean'](options.loop, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'loop' property from AudioBufferSourceOptions: The provided value (${options.loop}})`,
        });
      } else {
        parsedOptions.loop = false;
      }

      if (options && 'loopEnd' in options) {
        parsedOptions.loopEnd = conversions['double'](options.loopEnd, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'loopEnd' property from AudioBufferSourceOptions: The provided value (${options.loopEnd}})`,
        });
      } else {
        parsedOptions.loopEnd = 0;
      }

      if (options && 'loopStart' in options) {
        parsedOptions.loopStart = conversions['double'](options.loopStart, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'loopStart' property from AudioBufferSourceOptions: The provided value (${options.loopStart}})`,
        });
      } else {
        parsedOptions.loopStart = 0;
      }

      if (options && 'playbackRate' in options) {
        parsedOptions.playbackRate = conversions['float'](options.playbackRate, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'playbackRate' property from AudioBufferSourceOptions: The provided value (${options.playbackRate}})`,
        });
      } else {
        parsedOptions.playbackRate = 1;
      }

      super(context, parsedOptions);

      // keep the wrapped AudioBuffer around
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
