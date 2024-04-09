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

const AudioScheduledSourceNode = require('./AudioScheduledSourceNode.js');

module.exports = (jsExport, nativeBinding) => {
  class AudioBufferSourceNode extends AudioScheduledSourceNode {

    #playbackRate = null;
    #detune = null;

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'AudioBufferSourceNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
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
          if (!(options.buffer instanceof jsExport.AudioBuffer)) {
            throw new TypeError('Failed to construct \'AudioBufferSourceNode\': Failed to read the \'buffer\' property from AudioBufferSourceOptions: The provided value cannot be converted to \'AudioBuffer\'');
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

      let napiObj;

      try {
        napiObj = new nativeBinding.AudioBufferSourceNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

      // keep the wrapped AudioBuffer around
      Object.defineProperty(this, kAudioBuffer, {
        __proto__: null,
        enumerable: false,
        writable: true,
        value: null,
      });

      if (options && 'buffer' in options) {
        this[kAudioBuffer] = options.buffer;
      }

      // Bridge Rust native event to Node EventTarget
      bridgeEventTarget(this);

      this.#playbackRate = new AudioParam(this[kNapiObj].playbackRate);
      this.#detune = new AudioParam(this[kNapiObj].detune);
    }

    get playbackRate() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this.#playbackRate;
    }

    get detune() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this.#detune;
    }

    get buffer() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this[kAudioBuffer];
    }

    get loop() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this[kNapiObj].loop;
    }

    get loopStart() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this[kNapiObj].loopStart;
    }

    get loopEnd() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this[kNapiObj].loopEnd;
    }

    // @todo - should be able to set to null afterward
    set buffer(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
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

    set loop(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      try {
        this[kNapiObj].loop = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set loopStart(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      try {
        this[kNapiObj].loopStart = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set loopEnd(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      try {
        this[kNapiObj].loopEnd = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  Object.defineProperties(AudioBufferSourceNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(AudioBufferSourceNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AudioBufferSourceNode',
    },
    playbackRate: kEnumerableProperty,
    detune: kEnumerableProperty,
    buffer: kEnumerableProperty,
    loop: kEnumerableProperty,
    loopStart: kEnumerableProperty,
    loopEnd: kEnumerableProperty,

  });

  return AudioBufferSourceNode;
};
