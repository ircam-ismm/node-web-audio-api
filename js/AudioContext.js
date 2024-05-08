const conversions = require('webidl-conversions');

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
  kOnSinkChange,
  kWorkletRelease,
} = require('./lib/symbols.js');
const {
  propagateEvent,
} = require('./lib/events.js');

let contextId = 0;

module.exports = function(jsExport, nativeBinding) {

  class AudioContext extends jsExport.BaseAudioContext {
    #sinkId = '';
    #renderCapacity = null;
    #onsinkchange = null;

    constructor(options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError(`Failed to construct 'AudioContext': The provided value is not of type 'AudioContextOptions'`);
      }

      let targetOptions = {};

      if (options.latencyHint !== undefined) {
        if (['balanced', 'interactive', 'playback'].includes(options.latencyHint)) {
          targetOptions.latencyHint = conversions['DOMString'](options.latencyHint);
        } else {
          targetOptions.latencyHint = conversions['double'](options.latencyHint, {
            context: `Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions: The provided value (${options.latencyHint})`,
          });
        }
      } else {
        targetOptions.latencyHint = 'interactive';
      }

      if (options.sampleRate !== undefined) {
        targetOptions.sampleRate = conversions['float'](options.sampleRate, {
          context: `Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions: The provided value (${options.sampleRate})`,
        });
      } else {
        targetOptions.sampleRate = null;
      }

      if (options.sinkId !== undefined) {
        if (typeof options.sinkId === 'object') {
          // https://webaudio.github.io/web-audio-api/#enumdef-audiosinktype
          if (!('type' in options.sinkId) || options.sinkId.type !== 'none') {
            throw TypeError(`Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions: Failed to read the 'type' property from 'AudioSinkOptions': The provided value (${options.sinkId.type}) is not a valid enum value of type AudioSinkType.`);
          }

          targetOptions.sinkId = 'none';
        } else {
          targetOptions.sinkId = conversions['DOMString'](options.sinkId, {
            context: `Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions:  Failed to read the 'type' property from 'AudioSinkOptions': The provided value (${options.sinkId})`,
          });
        }
      } else {
        targetOptions.sinkId = '';
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.AudioContext(targetOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super({ [kNapiObj]: napiObj });

      if (options.sinkId !== undefined) {
        this.#sinkId = options.sinkId;
      }

      this.#renderCapacity = new jsExport.AudioRenderCapacity({
        [kNapiObj]: this[kNapiObj].renderCapacity,
      });

      // Add function to Napi object to bridge from Rust events to JS EventTarget
      this[kNapiObj][kOnStateChange] = (err, rawEvent) => {
        if (typeof rawEvent !== 'object' && !('type' in rawEvent)) {
          throw new TypeError('Invalid [kOnStateChange] Invocation: rawEvent should have a type property');
        }

        const event = new Event(rawEvent.type);
        propagateEvent(this, event);
      };

      this[kNapiObj][kOnSinkChange] = (err, rawEvent) => {
        if (typeof rawEvent !== 'object' && !('type' in rawEvent)) {
          throw new TypeError('Invalid [kOnSinkChange] Invocation: rawEvent should have a type property');
        }

        const event = new Event(rawEvent.type);
        propagateEvent(this, event);
      };

      // Workaround to bind the `sinkchange` and `statechange` events to EventTarget.
      // This must be called from JS facade ctor as the JS handler are added to the Napi
      // object after its instantiation, and that we don't have any initial `resume` call.
      this[kNapiObj].listen_to_events();

      // @todo - check if this is still required
      // prevent garbage collection and process exit
      const id = contextId++;
      // store in process to prevent garbage collection
      const kAudioContextId = Symbol(`node-web-audio-api:audio-context-${id}`);
      Object.defineProperty(process, kAudioContextId, {
        __proto__: null,
        enumerable: false,
        configurable: true,
        value: this,
      });
      // keep process awake until context is closed
      const keepAwakeId = setInterval(() => {}, 10 * 1000);

      // clear on close
      this.addEventListener('statechange', () => {
        if (this.state === 'closed') {
          // allow to garbage collect the context and to the close the process
          delete process[kAudioContextId];
          clearTimeout(keepAwakeId);
        }
      });
    }

    get baseLatency() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      return this[kNapiObj].baseLatency;
    }

    get outputLatency() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      return this[kNapiObj].outputLatency;
    }

    get sinkId() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      return this.#sinkId;
    }

    get renderCapacity() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      return this.#renderCapacity;
    }

    get onsinkchange() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      return this.#onsinkchange;
    }

    set onsinkchange(value) {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      if (isFunction(value) || value === null) {
        this.#onsinkchange = value;
      }
    }

    getOutputTimestamp() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::getOutputTimestamp is not yet implemented`);
    }

    async resume() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      await this[kNapiObj].resume();
    }

    async suspend() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      await this[kNapiObj].suspend();
    }

    async close() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      await this.audioWorklet[kWorkletRelease]();
      await this[kNapiObj].close();
    }

    async setSinkId(sinkId) {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'setSinkId' on 'AudioContext': 1 argument required, but only ${arguments.length} present`);
      }

      let targetSinkId = '';

      if (typeof sinkId === 'object') {
        if (!('type' in sinkId) || sinkId.type !== 'none') {
          throw new TypeError(`Failed to execute 'setSinkId' on 'AudioContext': Failed to read the 'type' property from 'AudioSinkOptions': The provided value '${sinkId.type}' is not a valid enum value of type AudioSinkType.`);
        }

        targetSinkId = 'none';
      } else {
        targetSinkId = conversions['DOMString'](sinkId, {
          context: `Failed to execute 'setSinkId' on 'AudioContext': Failed to read the 'type' property from 'AudioSinkOptions': The provided value '${sinkId.type}'`,
        });
      }

      this.#sinkId = sinkId;

      try {
        this[kNapiObj].setSinkId(targetSinkId);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    // online context only AudioNodes
    createMediaStreamSource(mediaStream) {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'createMediaStreamSource' on 'AudioContext': 1 argument required, but only ${arguments.length} present`);
      }

      const options = {
        mediaStream,
      };

      return new jsExport.MediaStreamAudioSourceNode(this, options);
    }

    createMediaElementSource() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::createMediaElementSource() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }

    createMediaStreamTrackSource() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::createMediaStreamTrackSource() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }

    createMediaStreamDestination() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::createMediaStreamDestination() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }
  }

  Object.defineProperties(AudioContext, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 0,
    },
  });

  Object.defineProperties(AudioContext.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AudioContext',
    },

    baseLatency: kEnumerableProperty,
    outputLatency: kEnumerableProperty,
    sinkId: kEnumerableProperty,
    renderCapacity: kEnumerableProperty,
    onsinkchange: kEnumerableProperty,
    getOutputTimestamp: kEnumerableProperty,
    resume: kEnumerableProperty,
    suspend: kEnumerableProperty,
    close: kEnumerableProperty,
    setSinkId: kEnumerableProperty,
    createMediaStreamSource: kEnumerableProperty,
    createMediaElementSource: kEnumerableProperty,
    createMediaStreamTrackSource: kEnumerableProperty,
    createMediaStreamDestination: kEnumerableProperty,
  });

  return AudioContext;
};
