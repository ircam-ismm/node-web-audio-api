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
const {
  Worker,
} = require('node:worker_threads');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class AudioWorkletNode extends AudioNode {

    #onaudioprocess = null;
    #worker = null;

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


      let napiObj;

      try {
        napiObj = new nativeBinding.AudioWorkletNode(context[kNapiObj], name, parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      console.log(name);
      var fs = require('fs');
      var path = require('path');
      var buffer = fs.readFileSync(path.join(process.cwd(), name));
      console.log(buffer.toString());
      this.#worker = new Worker(`
const { workerData } = require('node:worker_threads');
console.log("inside worker");
const { runAudioWorklet } = require('/Users/otto/Projects/node-web-audio-api-rs/index.js');
class AudioWorkletProcessor { }
var proc123;
function registerProcessor(name, ctor) {
  proc123 = new ctor(workerData);
}
${buffer}
runAudioWorklet()
`,
          {
              eval: true,
              workerData: options.processorOptions,
          }
      );
      console.log('worker is init');

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
