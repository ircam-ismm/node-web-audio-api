const fs = require('node:fs');
const path = require('node:path');
const {
  Worker,
} = require('node:worker_threads');

/* eslint-disable no-unused-vars */
const conversions = require('webidl-conversions');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');

/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class AudioWorkletNode extends AudioNode {

    #worker = null;
    #parameters = {};

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

      const buffer = fs.readFileSync(path.join(process.cwd(), name));
      console.log(buffer.toString());

      const indexCjs = path.join(__dirname, '..', 'index.cjs');

      const worker = new Worker(`
const { workerData } = require('node:worker_threads');
console.log("inside worker");
const { register_params, run_audio_worklet } = require('${indexCjs}');
class AudioWorkletProcessor { }
var proc123;
function registerProcessor(name, ctor) {
  register_params(ctor.parameterDescriptors ?? []);
  proc123 = new ctor(workerData);
}
${buffer}
run_audio_worklet()
`,
          {
              eval: true,
              workerData: options.processorOptions,
          }
      );
      console.log('worker is init');

      let napiObj;

      try {
        napiObj = new nativeBinding.AudioWorkletNode(context[kNapiObj], name, parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      for (let name in this[kNapiObj].parameters) {
        this.#parameters[name] = new jsExport.AudioParam({
          [kNapiObj]: this[kNapiObj].parameters[name],
        });
      }

      this.#worker = worker;
    }

    get parameters() {
      if (!(this instanceof AudioWorkletNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'DelayNode\'');
      }

      return this.#parameters;
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
  });

  return AudioWorkletNode;
};
