const { throwSanitizedError, DOMException } = require('./lib/errors.js');

const kNativeAudioBuffer = Symbol('node-web-audio-api:native-audio-buffer');
const kAudioBuffer = Symbol('node-web-audio-api:audio-buffer');

module.exports.AudioBuffer = (NativeAudioBuffer) => {
  class AudioBuffer {
    constructor(options) {
      if (kNativeAudioBuffer in options) {
        // internal constructor for `startRendering` and `decodeAudioData` cases
        this[kNativeAudioBuffer] = options[kNativeAudioBuffer];
      } else {
        // regular public constructor
        if (typeof options !== 'object') {
          throw new TypeError("Failed to construct 'AudioBuffer': argument 1 is not of type 'AudioBufferOptions'");
        }

        try {
          this[kNativeAudioBuffer] = new NativeAudioBuffer(options);
        } catch (err) {
          throwSanitizedError(err);
        }
      }
    }

    get sampleRate() {
      return this[kNativeAudioBuffer].sampleRate;
    }

    get duration() {
      return this[kNativeAudioBuffer].duration;
    }

    get length() {
      return this[kNativeAudioBuffer].length;
    }

    get numberOfChannels() {
      return this[kNativeAudioBuffer].numberOfChannels;
    }

    copyFromChannel(destination, channelNumber, bufferOffset = 0) {
      if (!(destination instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyFromChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
      }

      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyFromChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      try {
        this[kNativeAudioBuffer].copyFromChannel(destination, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    copyToChannel(source, channelNumber, bufferOffset = 0) {
      if (!(source instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyToChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
      }

      // rs implementation uses a usize so this check is irrelevant
      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyToChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      try {
        this[kNativeAudioBuffer].copyToChannel(source, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getChannelData(channel) {
      try {
        return this[kNativeAudioBuffer].getChannelData(channel);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  return AudioBuffer;
};

// so that AudioBufferSourceNode and ConvolverNode can retrieve the wrapped value to `super` class
module.exports.kNativeAudioBuffer = kNativeAudioBuffer;
module.exports.kAudioBuffer = kAudioBuffer;

