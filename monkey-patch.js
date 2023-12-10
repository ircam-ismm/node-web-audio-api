const fs = require('fs');

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

function isFunction(val) {
  return Object.prototype.toString.call(val) == '[object Function]' ||
    Object.prototype.toString.call(val) == '[object AsyncFunction]';
}

function isPositiveInt(n) {
  return Number.isSafeInteger(n) && 0 < n;
};

function isPositiveNumber(n) {
  return Number(n) === n && 0 < n;
};

class NotSupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotSupportedError';
  }
}

const symbolListeners =  Symbol('listeners');

function addEventListenerMixin(instance, eventName) {
  instance[`on${eventName}`] = null;

  if (!instance[symbolListeners]) {
    instance[symbolListeners] = new Map();
  }

  // use a Set, same function should not be executed twice
  instance[symbolListeners].set(eventName, new Set());

  if (!instance.addEventListener) {
    instance.addEventListener = (name, callback) => {
      // this is valid event name, otherwaise just ignore
      if (instance[symbolListeners].has(name)) {
        const callbacks = instance[symbolListeners].get(name);
        callbacks.add(callback);
      }
    }

    instance.removeEventListener = (name, callback) => {
      // this is valid event name, otherwaise just ignore
      if (instance[symbolListeners].has(name)) {
        const callbacks = instance[symbolListeners].get(name);
        callbacks.delete(callback);
      }
    }
  }

  // add a listener on native event
  // @todo - we should able to clean this listener on close, it prevents the
  // program to exit
  instance[`__on${eventName}`] = function(...args) {
    // parse args from rust, should end up with be something like:
    // e = Event {
    //   type: eventName,
    //   target: instance,
    //   currentTarget: instance,
    //   srcElement: instance,
    // };
    // see if we have some Event class natively in node
    const event = new Event(eventName);
    // this doesn't work, the event seems to be frozen
    event.target = instance;
    event.currentTarget = instance;
    event.srcElement = instance;

    if (isFunction(instance[`on${eventName}`])) {
      instance[`on${eventName}`](event);
    }

    const callbacks = instance[symbolListeners].get(eventName);
    callbacks.forEach(callback => callback(event));
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

      // monkey patch events
      addEventListenerMixin(this, 'statechange');

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
      if (!(audioData instanceof ArrayBuffer)) {
        // should be TypeError
        throw new Error(`Failed to execute 'decodeAudioData': parameter 1 is not of type 'ArrayBuffer'`);
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
      if (!(audioData instanceof ArrayBuffer)) {
        // should be TypeError
        throw new Error(`Failed to execute 'decodeAudioData': parameter 1 is not of type 'ArrayBuffer'`);
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

  return nativeBinding;
}
