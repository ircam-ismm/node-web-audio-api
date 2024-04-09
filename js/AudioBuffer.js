const conversions = require("webidl-conversions");

const { throwSanitizedError, DOMException } = require('./lib/errors.js');
const { kEnumerableProperty, kHiddenProperty } = require('./lib/utils.js');

const kNativeAudioBuffer = Symbol('node-web-audio-api:native-audio-buffer');
const kAudioBuffer = Symbol('node-web-audio-api:audio-buffer');

module.exports.AudioBuffer = (NativeAudioBuffer) => {
  class AudioBuffer {
    constructor(options) {
      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'AudioBuffer': 1 argument required, but only ${arguments.length} present`);
      }

      if (typeof options !== 'object') {
        throw new TypeError("Failed to construct 'AudioBuffer': argument 1 is not of type 'AudioBufferOptions'");
      }

      if (kNativeAudioBuffer in options) {
        // internal constructor for `startRendering` and `decodeAudioData` cases
        Object.defineProperty(this, kNativeAudioBuffer, {
          value: options[kNativeAudioBuffer],
          ...kHiddenProperty,
        });
      } else {
        // regular public constructor
        try {
          Object.defineProperty(this, kNativeAudioBuffer, {
            value: new NativeAudioBuffer(options),
            ...kHiddenProperty,
          });
        } catch (err) {
          throwSanitizedError(err);
        }
      }
    }

    get sampleRate() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'");
      }

      return this[kNativeAudioBuffer].sampleRate;
    }

    get duration() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'");
      }

      return this[kNativeAudioBuffer].duration;
    }

    get length() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'");
      }

      return this[kNativeAudioBuffer].length;
    }

    get numberOfChannels() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'");
      }

      return this[kNativeAudioBuffer].numberOfChannels;
    }

    copyFromChannel(destination, channelNumber, bufferOffset = 0) {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'");
      }

      if (!(destination instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyFromChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
      }

      // rust implementation uses a usize so this check must be done here
      // weirdly `conversions['unsigned long'](-1);` returns `4294967295``
      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyFromChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      channelNumber = conversions['unsigned long'](channelNumber);

      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyFromChannel' on 'AudioBuffer': bufferOffset must equal or greater than 0`, 'IndexSizeError');
      }

      bufferOffset = conversions['unsigned long'](bufferOffset);

      try {
        this[kNativeAudioBuffer].copyFromChannel(destination, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    copyToChannel(source, channelNumber, bufferOffset = 0) {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'");
      }

      if (!(source instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyToChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
      }

      // rust implementation uses a usize so this check must be done here
      // weirdly `conversions['unsigned long'](-1);` returns `4294967295``
      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyToChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      channelNumber = conversions['unsigned long'](channelNumber);

      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyToChannel' on 'AudioBuffer': bufferOffset must equal or greater than 0`, 'IndexSizeError');
      }

      bufferOffset = conversions['unsigned long'](bufferOffset);

      try {
        this[kNativeAudioBuffer].copyToChannel(source, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getChannelData(channel) {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'");
      }

      // rust implementation uses a usize so this check must be done here
      // weirdly `conversions['unsigned long'](-1);` returns `4294967295``
      if (channel < 0) {
        throw new DOMException(`Failed to execute 'getChannelData' on 'AudioBuffer': channel must equal or greater than 0`, 'IndexSizeError');
      }

      channel = conversions['unsigned long'](channel);

      try {
        return this[kNativeAudioBuffer].getChannelData(channel);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  Object.defineProperties(AudioBuffer, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(AudioBuffer.prototype,  {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AudioBuffer',
    },

    sampleRate: kEnumerableProperty,
    duration: kEnumerableProperty,
    length: kEnumerableProperty,
    numberOfChannels: kEnumerableProperty,
    copyFromChannel: kEnumerableProperty,
    copyToChannel: kEnumerableProperty,
    getChannelData: kEnumerableProperty,
  });

  return AudioBuffer;
};

// so that AudioBufferSourceNode and ConvolverNode can retrieve the wrapped value to `super` class
module.exports.kNativeAudioBuffer = kNativeAudioBuffer;
module.exports.kAudioBuffer = kAudioBuffer;

