const conversions = require('webidl-conversions');

const {
  bridgeEventTarget,
  propagateEvent,
} = require('./lib/events.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  kNapiObj,
  kOnStateChange,
  kOnComplete,
} = require('./lib/symbols.js');

module.exports = function patchOfflineAudioContext(jsExport, nativeBinding) {
  class OfflineAudioContext extends jsExport.BaseAudioContext {
    #renderedBuffer = null;

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

      // Add function to Napi object to bridge from Rust events to JS EventTarget
      // They will be effectively registered on rust side when `startRendering` is called
      this[kNapiObj][kOnStateChange] = (err, rawEvent) => {
        if (typeof rawEvent !== 'object' && !('type' in rawEvent)) {
          throw new TypeError('Invalid [kOnStateChange] Invocation: rawEvent should have a type property');
        }

        const event = new Event(rawEvent.type);
        propagateEvent(this, event);
      }

      // This event is, per spec, the last trigerred one
      this[kNapiObj][kOnComplete] = (err, rawEvent) => {
        if (typeof rawEvent !== 'object' && !('type' in rawEvent)) {
          throw new TypeError('Invalid [kOnComplete] Invocation: rawEvent should have a type property');
        }

        // @fixme: workaround the fact that this event seems to be triggered before
        // startRendering fulfills and that we want to return the exact same instance
        if (this.#renderedBuffer === null) {
          this.#renderedBuffer = new jsExport.AudioBuffer({ [kNapiObj]: rawEvent.renderedBuffer });
        }

        const event = new jsExport.OfflineAudioCompletionEvent(rawEvent.type, {
          renderedBuffer: this.#renderedBuffer,
        });

        propagateEvent(this, event);
      }
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

      let nativeAudioBuffer;

      try {
        nativeAudioBuffer = await this[kNapiObj].startRendering();
      } catch (err) {
        throwSanitizedError(err);
      }

      // @fixme: workaround the fact that this event seems to be triggered before
      // startRendering fulfills and that we want to return the exact same instance
      if (this.#renderedBuffer === null) {
        this.#renderedBuffer = new jsExport.AudioBuffer({ [kNapiObj]: nativeAudioBuffer });
      }

      return this.#renderedBuffer;
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
