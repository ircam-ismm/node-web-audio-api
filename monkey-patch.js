const fs = require('fs');

const isPlainObject = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

const { platform, arch } = process;
let contextId = 0;

function patchAudioContext(NativeAudioContext) {
  class AudioContext extends NativeAudioContext {
    constructor(options = {}) {

      // special handling of options on linux, these are not spec compliant but are
      // ment to be more user-friendly than what we have now (is subject to change)
      if (platform === 'linux') {
        // throw meaningfull error if several contexts are created on linux,
        // because of alsa backend we currently use
        if (contextId === 1) {
          throw new Error(`[node-web-audio-api] node-web-audio-api currently uses alsa as backend, therefore only one context can be safely created`);
        }

        // fallback latencyHint to "playback" on RPi if not explicitely defined
        if (arch === 'arm') {
          if (!('latencyHint' in options)) {
            options.latencyHint = 'playback';
          }
        }
      }

      super(options);
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

function patchOfflineAudioContext(NativeOfflineAudioContext) {
  class OfflineAudioContext extends NativeOfflineAudioContext {
    constructor(...args) {
      // handle initialisation with either an options object or a sequence of parameters
      // https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/OfflineAudioContext#parameters
      if( typeof args[0] === 'object'
          && 'numberOfChannels' in args[0] && 'length' in args[0] && 'sampleRate' in args[0]
      ) {
        const { numberOfChannels, length, sampleRate } = args[0];
        super( numberOfChannels, length, sampleRate );
      } else {
        super(...args);
      }

      // not sure this is usefull, to be tested
      const keepAwakeId = setInterval(() => {}, 10000);
      Object.defineProperty(this, '__keepAwakeId', {
        value: keepAwakeId,
        enumerable: false,
        writable: true,
        configurable: false,
      });
    }

    // promisify sync APIs
    startRendering() {
      try {
        const audioBuffer = super.startRendering();

        clearTimeout(this.__keepAwakeId);
        return Promise.resolve(audioBuffer);
      } catch (err) {
        return Promise.reject(err);
      }
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

  return OfflineAudioContext;
}

module.exports.patchAudioContext = patchAudioContext;
module.exports.patchOfflineAudioContext = patchOfflineAudioContext;

// dumb method provided to mock an xhr call and mimick browser's API
// see also `AudioContext.decodeAudioData`
module.exports.load = function(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: "${path}"`);
  }

  return { path };
}
