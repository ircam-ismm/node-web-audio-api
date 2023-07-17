const fs = require('fs');

const isPlainObject = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

const isPositiveInt = function(n) {
  return Number.isSafeInteger(n) && 0 < n;
};

const isPositiveNumber = function(n) {
  return Number(n) === n && 0 < n;
};

class NotSupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotSupportedError';
  }
}

const { platform, arch } = process;

let contextIds = {
  audioinput: 0,
  audiooutput: 0,
};

let enumerateDevicesSync = null;

function handleDefaultOptions(options, kind) {
  // increment contextIds as they are used to keep the process awake
  contextIds[kind] += 1;

  return options;
}

function patchAudioContext(nativeBinding) {
  class AudioContext extends nativeBinding.AudioContext {
    constructor(options = {}) {
      // special handling of options on linux, these are not spec compliant but are
      // ment to be more user-friendly than what we have now (is subject to change)
      options = handleDefaultOptions(options, 'audiooutput');
      super(options);
      // prevent garbage collection
      const processId = `__AudioContext_${contextIds['audiooutput']}`;
      process[processId] = this;

      Object.defineProperty(this, '__processId', {
        value: processId,
        enumerable: false,
        writable: false,
        configurable: false,
      });

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

    setSinkId(sinkId) {
      try {
        super.setSinkId(sinkId);
        Promise.resolve(undefined);
      } catch (err) {
        Promise.reject(err);
      }
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

function patchOfflineAudioContext(nativeBinding) {
  class OfflineAudioContext extends nativeBinding.OfflineAudioContext {
    constructor(...args) {
      // handle initialisation with either an options object or a sequence of parameters
      // https://webaudio.github.io/web-audio-api/#dom-offlineaudiocontext-constructor-contextoptions-contextoptions
      if (isPlainObject(args[0])
          && 'numberOfChannels' in args[0] && 'length' in args[0] && 'sampleRate' in args[0]
      ) {
        const { numberOfChannels, length, sampleRate } = args[0];
        args = [numberOfChannels, length, sampleRate];
      }

      const [numberOfChannels, length, sampleRate] = args;

      if (!isPositiveInt(numberOfChannels)) {
        throw new NotSupportedError(`Unsupported value for numberOfChannels: ${numberOfChannels}`);
      } else if (!isPositiveInt(length)) {
        throw new NotSupportedError(`Unsupported value for length: ${length}`);
      } else if (!isPositiveNumber(sampleRate)) {
        throw new NotSupportedError(`Unsupported value for sampleRate: ${sampleRate}`);
      }

      super(numberOfChannels, length, sampleRate);
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

// dumb method provided to mock an xhr call and mimick browser's API
// see also `AudioContext.decodeAudioData`
function load(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: "${path}"`);
  }

  return { path };
};

module.exports = function monkeyPatch(nativeBinding) {
  nativeBinding.AudioContext = patchAudioContext(nativeBinding);
  nativeBinding.OfflineAudioContext = patchOfflineAudioContext(nativeBinding);

  // Promisify MediaDevices API
  enumerateDevicesSync = nativeBinding.mediaDevices.enumerateDevices;
  nativeBinding.mediaDevices.enumerateDevices = async function enumerateDevices(options) {
    const list = enumerateDevicesSync();
    return Promise.resolve(list);
  }

  const getUserMediaSync = nativeBinding.mediaDevices.getUserMedia;
  nativeBinding.mediaDevices.getUserMedia = async function getUserMedia(options) {
    if (options === undefined) {
      throw new TypeError("Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested")
    }

    options = handleDefaultOptions(options, 'audioinput');
    const stream = getUserMediaSync(options);
    return Promise.resolve(stream);
  }

  // utils
  nativeBinding.load = load;

  return nativeBinding;
}
