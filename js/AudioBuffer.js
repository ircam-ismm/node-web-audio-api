const { throwSanitizedError, DOMException } = require('./lib/errors.js');

module.exports = (NativeAudioBuffer) => {
  class AudioBuffer extends NativeAudioBuffer {
    constructor(options) {
      if (typeof options !== 'object') {
        throw new TypeError("Failed to construct 'AudioBuffer': argument 1 is not of type 'AudioBufferOptions'");
      }

      try {
        super(options);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    copyFromChannel(destination, channelNumber, bufferOffset = 0) {
      if (!(destination instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyFromChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
      }

      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyFromChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      try {
        super.copyFromChannel(destination, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    copyToChannel(source, channelNumber, bufferOffset = 0) {
      if (!(source instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyToChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
      }

      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyToChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      try {
        super.copyToChannel(source, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getChannelData(channel) {
      try {
        return super.getChannelData(channel);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  return AudioBuffer;
};

