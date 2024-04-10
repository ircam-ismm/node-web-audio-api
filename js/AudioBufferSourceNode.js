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
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'AudioBufferSourceNode\': argument 2 is not of type \'AudioBufferSourceOptions\'');
      }

      if (options && options.buffer !== undefined) {
        if (options.buffer !== null) {
          if (!(options.buffer instanceof jsExport.AudioBuffer)) {
            throw new TypeError('Failed to construct \'AudioBufferSourceNode\': Failed to read the \'buffer\' property from AudioBufferSourceOptions: The provided value cannot be converted to \'AudioBuffer\'');
          }

          // unwrap napi audio buffer
          parsedOptions.buffer = options.buffer[kNativeAudioBuffer];
        } else {
          parsedOptions.buffer = null;
        }
      } else {
        parsedOptions.buffer = null;
      }

      if (options && options.detune !== undefined) {
        parsedOptions.detune = conversions['float'](options.detune, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'detune' property from AudioBufferSourceOptions: The provided value (${options.detune}})`,
        });
      } else {
        parsedOptions.detune = 0;
      }

      if (options && options.loop !== undefined) {
        parsedOptions.loop = conversions['boolean'](options.loop, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'loop' property from AudioBufferSourceOptions: The provided value (${options.loop}})`,
        });
      } else {
        parsedOptions.loop = false;
      }

      if (options && options.loopEnd !== undefined) {
        parsedOptions.loopEnd = conversions['double'](options.loopEnd, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'loopEnd' property from AudioBufferSourceOptions: The provided value (${options.loopEnd}})`,
        });
      } else {
        parsedOptions.loopEnd = 0;
      }

      if (options && options.loopStart !== undefined) {
        parsedOptions.loopStart = conversions['double'](options.loopStart, {
          context: `Failed to construct 'AudioBufferSourceNode': Failed to read the 'loopStart' property from AudioBufferSourceOptions: The provided value (${options.loopStart}})`,
        });
      } else {
        parsedOptions.loopStart = 0;
      }

      if (options && options.playbackRate !== undefined) {
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
      this[kAudioBuffer] = null;

      if (options && options.buffer !== undefined) {
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

    set buffer(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      if (value === null) {
        console.warn('Setting the \'buffer\' property on \'AudioBufferSourceNode\' to \'null\' is not supported yet');
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

    get loop() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this[kNapiObj].loop;
    }

    set loop(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      value = conversions['boolean'](value, {
        context: `Failed to set the 'loop' property on 'AudioBufferSourceNode': Value`,
      });

      try {
        this[kNapiObj].loop = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get loopStart() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this[kNapiObj].loopStart;
    }

    set loopStart(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'loopStart' property on 'AudioBufferSourceNode': Value`,
      });

      try {
        this[kNapiObj].loopStart = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get loopEnd() {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      return this[kNapiObj].loopEnd;
    }

    set loopEnd(value) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'loopEnd' property on 'AudioBufferSourceNode': Value`,
      });

      try {
        this[kNapiObj].loopEnd = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    start(when = 0, offset = null, duration = null) {
      if (!(this instanceof AudioBufferSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioBufferSourceNode\'');
      }

      if (when !== 0) {
        when = conversions['double'](when, {
          context: `Failed to execute 'start' on 'AudioBufferSourceNode': Parameter 1`,
        });
      }

      if (offset !== null) {
        offset = conversions['double'](offset, {
          context: `Failed to execute 'start' on 'AudioBufferSourceNode': Parameter 2`,
        });
      }

      if (duration !== null) {
        duration = conversions['double'](duration, {
          context: `Failed to execute 'start' on 'AudioBufferSourceNode': Parameter 3`,
        });
      }

      try {
        return this[kNapiObj].start(when, offset, duration);
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
