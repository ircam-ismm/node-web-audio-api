const { isFunction } = require('./lib/utils.js');

let contextId = 0;

const kProcessId = Symbol('processId');
const kKeepAwakeId = Symbol('keepAwakeId');

module.exports = function(NativeAudioContext) {
  class AudioContext extends NativeAudioContext {
    constructor(options = {}) {
      super(options);

      const id = contextId++;
      // store in process to prevent garbage collection
      const processId = Symbol(`__AudioContext_${id}`);
      process[processId] = this;
      // keep process symbol around to delete later
      this[kProcessId] = processId;
      // keep process awake until context is closed
      const keepAwakeId = setInterval(() => {}, 10000);
      this[kKeepAwakeId] = keepAwakeId;
    }

    // promisify sync APIs
    resume() {
      return Promise.resolve(super.resume());
    }

    suspend() {
      return Promise.resolve(super.suspend());
    }

    close() {
      // allow to garbage collect the context and to the close the process
      delete process[this[kProcessId]];
      clearTimeout(this[kKeepAwakeId]);

      return Promise.resolve(super.close());
    }

    setSinkId(sinkId) {
      try {
        super.setSinkId(sinkId);
        return Promise.resolve(undefined);
      } catch (err) {
        return Promise.reject(err);
      }
    }

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
  }

  return AudioContext;
};
