const fs = require('fs');

let contextId = 0;

module.exports.patchAudioContext = function(NativeAudioContext) {
  class AudioContext extends NativeAudioContext {
    constructor(...args) {
      super(...args);
      // prevent garbage collection
      const processId = `__AudioContext_${contextId}`;
      process[processId] = this;

      Object.defineProperty(this, '__processId', {
        value: processId,
        enumerable: false,
        writable: false,
        configurable: false,
      });

      contextId += 1;
      // keep process awake
      const keepAwakeId = setInterval(() => {}, 10000);
      Object.defineProperty(this, '__keepAwakeId', {
        value: keepAwakeId,
        enumerable: false,
        writable: true,
        configurable: false,
      });
    }

    // promisify sync APIs
    resume() {
      clearTimeout(this.__keepAwakeId);
      this.__keepAwakeId = setInterval(() => {}, 2000);
      return Promise.resolve(super.resume());
    }

    suspend() {
      return Promise.resolve(super.suspend());
    }

    close() {
       delete process[this.__processId];
       clearTimeout(this.__keepAwakeId);
       return Promise.resolve(super.close());
    }

    decodeAudioData(audioData) {
      try {
        const audioBuffer = super.decodeAudioData(audioData);
        return Promise.resolve(audioBuffer);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }

  return AudioContext;
}

// dumb method provided to mock an xhr call and mimick browser's API
// see also `AudioContext.decodeAudioData`
module.exports.load = function(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: "${path}"`);
  }

  return { path };
}
