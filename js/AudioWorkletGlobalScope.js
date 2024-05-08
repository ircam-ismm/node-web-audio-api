const {
  parentPort,
} = require('node:worker_threads');

const {
  run_audio_worklet,
} = require('../load-native.cjs');

const kHiddenOptions = Symbol('node-web-audio-api:hidden-options');
const kWorkletInputs = Symbol.for('node-web-audio-api:worklet-inputs');
const kWorkletOutputs = Symbol.for('node-web-audio-api:worklet-outputs');
const nameProcessorCtorMap = new Map();
const paramDescriptorRegisteredMap = new Map();
// const processorIdMap = new WeakMap(); // instance, uuid
let loopStarted = false;

function isIterable(obj) {
  // checks for null and undefined
  if (obj === null || obj === undefined) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function runLoop() {
  // block until we need to render a quantum
  run_audio_worklet();
  // yield to the event loop, and then repeat
  setImmediate(runLoop);
}

class AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  #port = null;

  constructor(options) {
    const { port, numberOfInputs, numberOfOutputs } = options[kHiddenOptions];

    this.#port = port;
    this[kWorkletInputs] = new Array(numberOfInputs).fill([]);
    this[kWorkletOutputs] = new Array(numberOfOutputs).fill([]);
    // @todo - use `outputChannelCount`
  }

  get port() {
    if (!(this instanceof AudioWorkletProcessor)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletProcessor\'');
    }

    return this.#port;
  }
}

// create registerProcessor method with memoized promiseId

function registerProcessor(name, processorCtor) {
  nameProcessorCtorMap.set(name, processorCtor);

  // must support Array, Set or iterators
  let parameterDescriptors = processorCtor.parameterDescriptors;

  if (!isIterable(parameterDescriptors)) {
    // mark as invalid parameterDescriptors
    paramDescriptorRegisteredMap.set(name, null);
  } else {
    parameterDescriptors = Array.from(parameterDescriptors);
    paramDescriptorRegisteredMap.set(name, parameterDescriptors);
  }
};


// @todo - recheck this, not sure this is relevant in our case
// NOTE: Authors that register an event listener on the "message" event of this
// port should call close on either end of the MessageChannel (either in the
// AudioWorklet or the AudioWorkletGlobalScope side) to allow for resources to be collected.

parentPort.on('message', event => {
  console.log(event.cmd + '\n');

  switch (event.cmd) {
    case 'node-web-audio-api:worklet:add-module': {
      const { code, promiseId } = event;
      const func = new Function('AudioWorkletProcessor', 'registerProcessor', code);
      func(AudioWorkletProcessor, registerProcessor);

      // send registered param descriptors on main thread and resolve Promise
      parentPort.postMessage({
        cmd: 'node-web-audio-api:worklet:processor-registered',
        promiseId,
        paramDescriptorRegisteredMap,
      });

      paramDescriptorRegisteredMap.clear();
      break;
    }
    case 'node-web-audio-api:worklet:create-processor': {
      const { name, id, options, port } = event;
      const ctor = nameProcessorCtorMap.get(name);
      // options to be passed to the processor parent for intialization
      const {
        numberOfInputs,
        numberOfOutputs,
        processorOptions,
        outputChannelCount, // @todo - clarify usage
      } = options;
      // rewrap options of interest for the AudioWorkletNodeBaseClass
      const hiddenOptions = {
        port,
        numberOfInputs,
        numberOfOutputs,
      };

      processorOptions[kHiddenOptions] = hiddenOptions;
      const instance = new ctor(processorOptions);
      // store in global so that Rust can match the JS processor
      // with its corresponding NapiAudioWorkletProcessor
      globalThis[`${id}`] = instance;

      if (!loopStarted) {
        loopStarted = true;
        setImmediate(runLoop);
      }
      break;
    }
  }
});
