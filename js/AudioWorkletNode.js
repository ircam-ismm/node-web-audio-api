const fs = require('node:fs');
const path = require('node:path');
const {
  Worker,
} = require('node:worker_threads');

/* eslint-disable no-unused-vars */
const conversions = require('webidl-conversions');
const {
  toSanitizedSequence,
} = require('./lib/cast.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');

/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');
const IMPLEMENTATION_MAX_NUMBER_OF_CHANNELS = 32;

module.exports = (jsExport, nativeBinding) => {
  class AudioWorkletNode extends AudioNode {

    #worker = null;
    #parameters = {};

    // dictionary AudioWorkletNodeOptions : AudioNodeOptions {
    //     unsigned long numberOfInputs = 1;
    //     unsigned long numberOfOutputs = 1;
    //     sequence<unsigned long> outputChannelCount;
    //     record<DOMString, double> parameterData;
    //     object processorOptions;
    // };
    constructor(context, name, options) {

      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'AudioWorkletNode': 2 arguments required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'AudioWorkletNode': argument 1 is not of type BaseAudioContext`);
      }

      // @todo
      // - check that context.#audioWorkletGlobalScope exists
      // - cehck that name has been registered through add module
      const parsedName = conversions['DOMString'](name, {
        context: `Failed to construct 'AudioWorkletNode': The given 'AudioWorkletProcessor' name`
      });

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && (typeof options !== 'object' || options === null)) {
        throw new TypeError('Failed to construct \'AudioWorkletNode\': argument 3 is not of type \'AudioWorkletNodeOptions\'');
      }

      if (options && options.numberOfInputs !== undefined) {
        parsedOptions.numberOfInputs = conversions['unsigned long'](options.numberOfInputs, {
          enforceRange: true,
          context: `Failed to construct 'AudioWorkletNode': Failed to read the 'numberOfInputs' property from AudioWorkletNodeOptions: The provided value (${options.numberOfInputs}})`,
        });
      } else {
        parsedOptions.numberOfInputs = 1;
      }

      if (options && options.numberOfOutputs !== undefined) {
        parsedOptions.numberOfOutputs = conversions['unsigned long'](options.numberOfOutputs, {
          enforceRange: true,
          context: `Failed to construct 'AudioWorkletNode': Failed to read the 'numberOfOutputs' property from AudioWorkletNodeOptions: The provided value (${options.numberOfOutputs}})`,
        });
      } else {
        parsedOptions.numberOfOutputs = 1;
      }

      // If outputChannelCount exists,
      // - If any value in outputChannelCount is zero or greater than the implementation’s maximum number of channels, throw a NotSupportedError and abort the remaining steps.
      // - If the length of outputChannelCount does not equal numberOfOutputs, throw an IndexSizeError and abort the remaining steps.
      // - If both numberOfInputs and numberOfOutputs are 1, set the channel count of the node output to the one value in outputChannelCount.
      // - Otherwise set the channel count of the kth output of the node to the kth element of outputChannelCount sequence and return.
      if (options && options.outputChannelCount !== undefined) {
        try {
          parsedOptions.outputChannelCount = toSanitizedSequence(options.outputChannelCount, Uint32Array);
        } catch (err) {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Failed to read the 'outputChannelCount' property from AudioWorkletNodeOptions: The provided value ${err.message}`);
        }

        parsedOptions.outputChannelCount.forEach((value, index) => {
          if (value <= 0 || value > IMPLEMENTATION_MAX_NUMBER_OF_CHANNELS) {
            throw new DOMException(`Failed to construct 'AudioWorkletNode': Invalid 'outputChannelCount' property from AudioWorkletNodeOptions: Value at index ${index} in outside supported range [1, 32]`, 'NotSupportedError');
          }
        });

        if (parsedOptions.numberOfOutputs !== parsedOptions.outputChannelCount.length) {
          throw new DOMException(`Failed to construct 'AudioWorkletNode': Invalid 'outputChannelCount' property from AudioWorkletNodeOptions: 'outputChannelCount' length (${parsedOptions.outputChannelCount.length}) does not equal 'numberOfOutputs' (${parsedOptions.numberOfOutputs})`, 'IndexSizeError');
        }
      } else {
        // If outputChannelCount does not exists,
        // - If both numberOfInputs and numberOfOutputs are 1, set the initial channel count of the node output to 1 and return.
        //   NOTE: For this case, the output chanel count will change to computedNumberOfChannels dynamically based on the input and the channelCountMode at runtime.
        // - Otherwise set the channel count of each output of the node to 1 and return.

        // @note - not sure what this means, let's go simple
        parsedOptions.outputChannelCount = new Uint32Array(parsedOptions.numberOfOutputs);
        parsedOptions.outputChannelCount.fill(1);
      }

      // @todo
      // - This should be a "record", let's treat it as a raw object of now
      // - Check if this needs to checked against the declared `parameterDescriptors`
      if (options && options.parameterData !== undefined) {
        if (typeof options.parameterData === 'object' && options.parameterData !== null) {
          parsedOptions.parameterData = {};

          for (let [key, value] in Object.entries(options.parameterData)) {
            const parsedKey = conversions['DOMString'](key, {
              context: `Failed to construct 'AudioWorkletNode': Invalid 'parameterData' property from AudioWorkletNodeOptions: Invalid key (${key})`,
            });

            const parsedValue = conversions['double'](value, {
              context: `Failed to construct 'AudioWorkletNode': Invalid 'parameterData' property from AudioWorkletNodeOptions: Invalid value for key ${parsedKey}`,
            });

            parsedOptions.parameterData[parsedKey] = parsedValue;
          }
        } else {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Invalid 'parameterData' property from AudioWorkletNodeOptions: 'outputChannelCount' length (${parsedOptions.outputChannelCount.length}) does not equal 'numberOfOutputs' (${parsedOptions.numberOfOutputs})`);
        }
      } else {
        parsedOptions.parameterData = {};
      }

      if (options && options.processorOptions !== undefined) {
        if (typeof options.processorOptions === 'object' && options.processorOptions !== null) {
          parsedOptions.processorOptions = Object.assign(options.processorOptions);
        } else {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Invalid 'processorOptions' property from AudioWorkletNodeOptions: 'processorOptions' is not an object`);
        }
      } else {
        parsedOptions.processorOptions = {};
      }

      const buffer = fs.readFileSync(path.join(process.cwd(), name));
      console.log(buffer.toString(), parsedOptions);

      const indexCjs = path.join(__dirname, '..', 'index.cjs');

      const worker = new Worker(`
const { workerData, parentPort } = require('node:worker_threads');
console.log("inside worker");
const { register_params, run_audio_worklet } = require('${indexCjs}');
class AudioWorkletProcessor {
    constructor(options) {
        this.port = parentPort;
    }
}
var proc123;
function registerProcessor(name, ctor) {
  register_params(ctor.parameterDescriptors ?? []);
  proc123 = new ctor(workerData);
}
${buffer}
function run_loop() {
    // block until we need to render a quantum
    run_audio_worklet();
    // yield to the event loop, and then repeat
    setImmediate(run_loop);
}
run_loop();
`,
          {
              eval: true,
              workerData: options.processorOptions,
          }
      );
      console.log('worker is init');

      let napiObj;

      try {
        napiObj = new nativeBinding.AudioWorkletNode(context[kNapiObj], parsedName, parsedOptions);
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

      // TODO this works because the Worker has `postMessage` and `on('message')`
      // but we should probably use an actual MessagePort instance here..
      this.port = worker;
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
      value: 2,
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
