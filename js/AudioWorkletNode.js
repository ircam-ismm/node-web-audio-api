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

      const indexJs = path.join(__dirname, '..', 'index.js');

      const worker = new Worker(`
const { workerData } = require('node:worker_threads');
console.log("inside worker");
const { runAudioWorklet, registerParams } = require('${indexJs}');
class AudioWorkletProcessor { }
var proc123;
function registerProcessor(name, ctor) {
  registerParams(ctor.parameterDescriptors);
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

      let napiObj;

      try {
        napiObj = new nativeBinding.AudioWorkletNode(context[kNapiObj], name, parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });
      this.#worker = worker;
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
