const conversions = require('webidl-conversions');

const {
  bridgeEventTarget,
} = require('./lib/events.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  kNapiObj
} = require('./lib/symbols.js');

// constructor(OfflineAudioContextOptions contextOptions);
// constructor(unsigned long numberOfChannels, unsigned long length, float sampleRate);
// Promise<AudioBuffer> startRendering();
// Promise<undefined> resume();
// Promise<undefined> suspend(double suspendTime);
// readonly attribute unsigned long length;
// attribute EventHandler oncomplete;

module.exports = function patchOfflineAudioContext(jsExport, nativeBinding) {
  class OfflineAudioContext extends jsExport.BaseAudioContext {
    constructor(...args) {
      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'OfflineAudioContext': 1 argument required, but only ${arguments.length} present`);
      }

      // https://webaudio.github.io/web-audio-api/#dom-offlineaudiocontext-constructor-contextoptions-contextoptions
      if (arguments.length === 1) {
        const options = args[0];

        if (typeof options !== 'object') {
          throw new TypeError(`Failed to construct 'OfflineAudioContext': argument 1 is not of type 'OfflineAudioContextOptions'`);
        }

        if (options.length === undefined) {
          throw new TypeError(`Failed to construct 'OfflineAudioContext': Failed to read the 'length' property from 'OfflineAudioContextOptions': Required member is undefined.`);
        }

        if (options.sampleRate === undefined) {
          throw new TypeError(`Failed to construct 'OfflineAudioContext': Failed to read the 'sampleRate' property from 'OfflineAudioContextOptions': Required member is undefined.`);
        }

        if (options.numberOfChannels === undefined) {
          options.numberOfChannels = 1;
        }

        args = [
          options.numberOfChannels,
          options.length,
          options.sampleRate
        ];
      }

      let [numberOfChannels, length, sampleRate] = args;

      numberOfChannels = conversions['unsigned long'](numberOfChannels, {
        enforceRange: true,
        context: `Failed to construct 'OfflineAudioContext': Failed to read the 'numberOfChannels' property from OfflineContextOptions; The provided value (${numberOfChannels})`
      });

      length = conversions['unsigned long'](length, {
        enforceRange: true,
        context: `Failed to construct 'OfflineAudioContext': Failed to read the 'length' property from OfflineContextOptions; The provided value (${length})`
      });

      sampleRate = conversions['float'](sampleRate, {
        context: `Failed to construct 'OfflineAudioContext': Failed to read the 'sampleRate' property from OfflineContextOptions; The provided value (${sampleRate})`
      });

      let napiObj;

      try {
        napiObj = new nativeBinding.OfflineAudioContext(numberOfChannels, length, sampleRate);
      } catch (err) {
        throwSanitizedError(err);
      }

      super({ [kNapiObj]: napiObj });
    }

    get length() {
      if (!(this instanceof OfflineAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'OfflineAudioContext'");
      }

      return this[kNapiObj].length;
    }

    get oncomplete() {
      if (!(this instanceof OfflineAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'OfflineAudioContext'");
      }

      return this._complete || null;
    }

    set oncomplete(value) {
      if (!(this instanceof OfflineAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'OfflineAudioContext'");
      }

      if (isFunction(value) || value === null) {
        this._complete = value;
      }
    }

    async startRendering() {
      if (!(this instanceof OfflineAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'OfflineAudioContext'");
      }

      // Lazily register event callback on rust side
      bridgeEventTarget(this);

      let nativeAudioBuffer;

      try {
        nativeAudioBuffer = await this[kNapiObj].startRendering();
      } catch (err) {
        throwSanitizedError(err);
      }

      const audioBuffer = new jsExport.AudioBuffer({ [kNapiObj]: nativeAudioBuffer });

      // We dispatch the complete event manually to simplify the sharing of the
      // `AudioBuffer` instance. This also simplifies code on the rust side as
      // we don't need to deal with the `OfflineAudioCompletionEvent` type.
      const event = new Event('complete');
      event.renderedBuffer = audioBuffer;

      if (isFunction(this[`oncomplete`])) {
        this[`oncomplete`](event);
      }

      this.dispatchEvent(event);

      return audioBuffer;
    }

    async resume() {
      if (!(this instanceof OfflineAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'OfflineAudioContext'");
      }

      try {
        await this[kNapiObj].resume();
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    async suspend(suspendTime) {
      if (!(this instanceof OfflineAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'OfflineAudioContext'");
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'suspend' on 'OfflineAudioContext': 1 argument required, but only ${arguments.length} present`);
      }

      suspendTime = conversions['double'](suspendTime, {
        context: `Failed to execute 'suspend' on 'OfflineAudioContext': argument 1`,
      });

      try {
        await this[kNapiObj].suspend(suspendTime);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  Object.defineProperties(OfflineAudioContext, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(OfflineAudioContext.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'OfflineAudioContext',
    },

    length: kEnumerableProperty,
    oncomplete: kEnumerableProperty,
    startRendering: kEnumerableProperty,
    resume: kEnumerableProperty,
    suspend: kEnumerableProperty,
  });

  return OfflineAudioContext;
};
