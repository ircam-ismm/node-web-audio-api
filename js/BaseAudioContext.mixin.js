const { isFunction } = require('./lib/utils.js');

// @todo - generate

module.exports = (superclass, bindings) => {
  const {
    AudioBufferSourceNode,
    ConstantSourceNode,
    OscillatorNode,
  } = bindings;

  class BaseAudioContext extends superclass {
    // This is not exactly what the spec says, but if we reject the promise
    // when `decodeErrorCallback` is present the program will crash in an
    // unexpected manner
    // cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-decodeaudiodata
    decodeAudioData(audioData, decodeSuccessCallback, decodeErrorCallback) {
      if (!(audioData instanceof ArrayBuffer)) {
        throw new TypeError(`Failed to execute 'decodeAudioData': parameter 1 is not of type 'ArrayBuffer'`);
      }

      try {
        const audioBuffer = super.decodeAudioData(audioData);

        if (isFunction(decodeSuccessCallback)) {
          decodeSuccessCallback(audioBuffer);
        } else {
          return Promise.resolve(audioBuffer);
        }
      } catch (err) {
        if (isFunction(decodeErrorCallback)) {
          decodeErrorCallback(err);
        } else {
          return Promise.reject(err);
        }
      }
    }

    // make sure we use the patched `AudioNodes` in factory method
    createBufferSource() {
      return new AudioBufferSourceNode(this);
    }

    createConstantSource() {
      return new ConstantSourceNode(this);
    }

    createOscillator() {
      return new OscillatorNode(this);
    }
  }

  return BaseAudioContext;
};
