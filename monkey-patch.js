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
let contextId = {
  audioinput: 0,
  audiooutput: 0,
};
let enumerateDevicesSync = null;

function getDefaultOptions(options, kind) {
  // special handling of options on linux, these are not spec compliant but are
  // ment to be more user-friendly than what we have now (is subject to change)
  // try to find some jack server and fallback on alsa if not found
  if (platform === 'linux') {
    // check if we have JACK server running
    const devices = enumerateDevicesSync();
    console.log(devices);
    const jackDevice = devices.find(device => {
      console.log(device.kind, kind);
      console.log(device.label, 'jack');
      return device.kind === kind && device.label === 'jack';
    });

    if (jackDevice && !('sinkId' in options)) {
      console.log('> Using JACK server');
      options.sinkId = jackDevice.deviceId;
    } else {
      console.log('> Using ALSA backend');
      // throw meaningfull error if several contexts are created on linux,
      // because of alsa backend only accept 1 client
      if (contextId[kind] === 1) {
        throw new Error(`[node-web-audio-api] node-web-audio-api currently uses alsa as backend, therefore only one context can be safely created`);
      }

      contextId[kind] += 1;

      // fallback latencyHint to "playback" on RPi w/ alsa if not explicitely defined
      if (arch === 'arm') {
        if (!('latencyHint' in options)) {
          options.latencyHint = 'playback';
        }
      }
    }
  }

  return options;
}

function patchAudioContext(nativeBinding) {
  class AudioContext extends nativeBinding.AudioContext {
    constructor(options = {}) {

      options = getDefaultOptions(options, 'audiooutput');
      console.log(options);

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

function patchOfflineAudioContext(nativeBinding) {
  class OfflineAudioContext extends nativeBinding.OfflineAudioContext {
    constructor(...args) {
      // handle initialisation with either an options object or a sequence of parameters
      // https://webaudio.github.io/web-audio-api/#dom-offlineaudiocontext-constructor-contextoptions-contextoptions
      if (typeof args[0] === 'object'
          && 'numberOfChannels' in args[0] && 'length' in args[0] && 'sampleRate' in args[0]
      ) {
        const { numberOfChannels, length, sampleRate } = args[0];
        args = [numberOfChannels, length, sampleRate];
      }

      if (!isPositiveInt(args[0])) {
        throw new NotSupportedError(`Unsupported value for numberOfChannels: ${args[0]}`);
      } else if (!isPositiveInt(args[1])) {
        throw new NotSupportedError(`Unsupported value for length: ${args[1]}`);
      } else if (!isPositiveNumber(args[2])) {
        throw new NotSupportedError(`Unsupported value for sampleRate: ${args[2]}`);
      }

      super(...args);
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

// dumb method provided to mock an xhr call and mimick browser's API
// see also `AudioContext.decodeAudioData`
function load(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: "${path}"`);
  }

  return { path };
};

module.exports = function monkeyPatch(nativeBinding) {
  //
  nativeBinding.AudioContext = patchAudioContext(nativeBinding);
  nativeBinding.OfflineAudioContext = patchOfflineAudioContext(nativeBinding);
  nativeBinding.load = load;

  // media devices shim
  nativeBinding.mediaDevices = {}

  class MediaStream extends nativeBinding.Microphone {};
  nativeBinding.Microphone = undefined;

  nativeBinding.mediaDevices.getUserMedia = function getUserMedia(options) {
      if (options && options.audio === true) {
          const mic = new MediaStream();
          return Promise.resolve(mic);
      } else {
          throw new NotSupportedError(`Only { audio: true } is currently supported`);
      }
  }

  enumerateDevicesSync = nativeBinding.enumerateDevices;
  nativeBinding.enumerateDevices = undefined;

  class MediaDeviceInfo {
    constructor(obj) {
      this.deviceId = obj.deviceId;
      this.groupId = obj.groupId;
      this.kind = obj.kind;
      this.label = obj.label;
    }
  }

  nativeBinding.mediaDevices.enumerateDevices = function enumerateDevices() {
    const list = enumerateDevicesSync().map(d => new MediaDeviceInfo(d));
    return Promise.resolve(list);
  }

  return nativeBinding;
}
