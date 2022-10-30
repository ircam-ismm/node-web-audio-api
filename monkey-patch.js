const fs = require('fs');

let contextId = 0;

const isPlainObject = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

function audioContextExtender(NativeAudioContext) {
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
      if (!isPlainObject(audioData) || !('path' in audioData)) {
        throw new Error(`Invalid argument, please consider using the load helper`);
      }

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

function offlineAudioContextExtender(NativeAudioContext) {
  class OfflineAudioContext extends audioContextExtender(NativeAudioContext) {
    constructor(...args) {
      super(...args);
    }

    // promisify sync APIs
    startRendering() {
      // TODO: is this necessary for startRendering() ?
      clearTimeout(this.__keepAwakeId);
      this.__keepAwakeId = setInterval(() => {}, 2000);

      try {
        const audioBuffer = super.startRendering();
        return Promise.resolve(audioBuffer);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }

  return OfflineAudioContext;
}

module.exports.patchAudioContext = audioContextExtender(NativeAudioContext);

module.exports.patchOfflineAudioContext = offlineAudioContextExtender(NativeAudioContext);

// dumb method provided to mock an xhr call and mimick browser's API
// see also `AudioContext.decodeAudioData`
module.exports.load = function(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: "${path}"`);
  }

  return { path };
}
