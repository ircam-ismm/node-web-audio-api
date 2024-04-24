/* eslint-disable no-unused-vars */
const conversions = require('webidl-conversions');
const {
  toSanitizedSequence,
} = require('./lib/cast.js');
const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kNapiObj,
  kAudioBuffer,
  kOnAudioProcess,
} = require('./lib/symbols.js');
const {
  propagateEvent,
} = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class AudioWorkletNode extends AudioNode {

    #onaudioprocess = null;

    constructor(context, name, options) {

      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'AudioWorkletNode': 2 arguments required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'AudioWorkletNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'AudioWorkletNode\': argument 3 is not of type \'AudioWorkletNodeOptions\'');
      }

      console.log(name);

      let napiObj;

      try {
        napiObj = new nativeBinding.AudioWorkletNode(context[kNapiObj], name, parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      this[kNapiObj][kOnAudioProcess] = (err, rawEvent) => {
        if (typeof rawEvent !== 'object' && !('type' in rawEvent)) {
          throw new TypeError('Invalid [kOnStateChange] Invocation: rawEvent should have a type property');
        }

        const audioProcessingEventInit = {
          playbackTime: rawEvent.playbackTime,
          inputBuffer: new jsExport.AudioBuffer({ [kNapiObj]: rawEvent.inputBuffer }),
          outputBuffer: new jsExport.AudioBuffer({ [kNapiObj]: rawEvent.outputBuffer }),
        };

        const event = new jsExport.AudioProcessingEvent('audioprocess', audioProcessingEventInit);
        propagateEvent(this, event);
      };

      this[kNapiObj].listen_to_events();
    }

    get bufferSize() {
      if (!(this instanceof AudioWorkletNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletNode\'');
      }

      return this[kNapiObj].bufferSize;
    }

    get onaudioprocess() {
      if (!(this instanceof AudioWorkletNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletNode\'');
      }

      return this.#onaudioprocess;
    }

    set onaudioprocess(value) {
      if (!(this instanceof AudioWorkletNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletNode\'');
      }

      if (isFunction(value) || value === null) {
        this.#onaudioprocess = value;
      }
    }
  }

  Object.defineProperties(AudioWorkletNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 0,
    },
  });

  Object.defineProperties(AudioWorkletNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AudioWorkletNode',
    },
    bufferSize: kEnumerableProperty,
    onaudioprocess: kEnumerableProperty,

  });

  return AudioWorkletNode;
};
