const {
  parentPort,
  workerData,
  markAsUntransferable,
} = require('node:worker_threads');

const conversions = require('webidl-conversions');

// these are defined in rust side
const {
  exit_audio_worklet_global_scope,
  run_audio_worklet_global_scope,
} = require('../load-native.cjs');

const {
  workletId,
  sampleRate,
} = workerData;

const kWorkletQueueTask = Symbol.for('node-web-audio-api:worklet-queue-task');
const kWorkletCallableProcess = Symbol.for('node-web-audio-api:worklet-callable-process');
const kWorkletInputs = Symbol.for('node-web-audio-api:worklet-inputs');
const kWorkletOutputs = Symbol.for('node-web-audio-api:worklet-outputs');
const kWorkletParams = Symbol.for('node-web-audio-api:worklet-params');
const kWorkletParamsCache = Symbol.for('node-web-audio-api:worklet-params-cache');
const kWorkletGetBuffer = Symbol.for('node-web-audio-api:worklet-get-buffer');
const kWorkletRecycleBuffer = Symbol.for('node-web-audio-api:worklet-recycle-buffer');
const kWorkletMarkAsUntransferable = Symbol.for('node-web-audio-api:worklet-mark-as-untransferable');
// const kWorkletOrderedParamNames = Symbol.for('node-web-audio-api:worklet-ordered-param-names');


const nameProcessorCtorMap = new Map();
const processors = {};
let pendingProcessorConstructionData = null;
let loopStarted = false;
let runLoopImmediateId = null;

class BufferPool {
  #bufferSize;
  #pool;

  constructor(bufferSize, initialPoolSize) {
    this.#bufferSize = bufferSize;
    this.#pool = new Array(initialPoolSize);

    for (let i = 0; i < this.#pool.length; i++) {
      this.#pool[i] = this.#allocate();
    }
  }

  #allocate() {
    const float32 = new Float32Array(this.#bufferSize);
    markAsUntransferable(float32);
    // Mark underlying buffer as untransfrable too, this will fail one of
    // the task in `audioworkletprocessor-process-frozen-array.https.html`
    // but prevent segmentation fault
    markAsUntransferable(float32.buffer);

    return float32;
  }

  get() {
    if (this.#pool.length === 0) {
      return this.#allocate();
    }

    return this.#pool.pop();
  }

  recycle(buffer) {
    this.#pool.push(buffer);
  }
}

const renderQuantumSize = 128;

const pool128 = new BufferPool(renderQuantumSize, 256);
const pool1 = new BufferPool(1, 64);
// allow rust to access some methods required when io layout change
globalThis[kWorkletGetBuffer] = () => pool128.get();
globalThis[kWorkletRecycleBuffer] = buffer => pool128.recycle(buffer);
globalThis[kWorkletMarkAsUntransferable] = obj => {
  markAsUntransferable(obj);
  return obj;
}

function isIterable(obj) {
  // checks for null and undefined
  if (obj === null || obj === undefined) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

// cf. https://stackoverflow.com/a/46759625
function isConstructor(f) {
  try {
    Reflect.construct(String, [], f);
  } catch (e) {
    return false;
  }
  return true;
}

function runLoop() {
  // block until we need to render a quantum
  run_audio_worklet_global_scope(workletId, processors);
  // yield to the event loop, and then repeat
  runLoopImmediateId = setImmediate(runLoop);
}

globalThis.currentTime = 0
globalThis.currentFrame = 0;
globalThis.sampleRate = sampleRate;
// @todo - implement in upstream crate
globalThis.renderQuantumSize = renderQuantumSize;

globalThis.AudioWorkletProcessor = class AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  #port = null;

  constructor() {
    const {
      port,
      numberOfInputs,
      numberOfOutputs,
      parameterDescriptors,
    } = pendingProcessorConstructionData;

    // Mark [[callable process]] as true, set to false in render quantum
    // either "process" doese not exists, either it throws an error
    this[kWorkletCallableProcess] = true;

    // Populate with dummy values which will be replaced in first render call
    this[kWorkletInputs] = new Array(numberOfInputs).fill([]);
    this[kWorkletOutputs] = new Array(numberOfOutputs).fill([]);

    // Object to be reused as `process` parameters argument
    this[kWorkletParams] = {};
    // Cache of 2 Float32Array (of length 128 and 1) for each param, to be reused on
    // each process call according to the size the param for the current render quantum
    this[kWorkletParamsCache] = {};

    parameterDescriptors.forEach(desc => {
      this[kWorkletParamsCache][desc.name] = [
        pool128.get(), // should be globalThis.renderQuantumSize
        pool1.get(),
      ]
    });

    this.#port = port;
  }

  get port() {
    if (!(this instanceof AudioWorkletProcessor)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletProcessor\'');
    }

    return this.#port;
  }

  [kWorkletQueueTask](cmd, err) {
    this.#port.postMessage({ cmd, err });
  }
}

// follow algorithm from:
// https://webaudio.github.io/web-audio-api/#dom-audioworkletglobalscope-registerprocessor
globalThis.registerProcessor = function registerProcessor(name, processorCtor) {
  const parsedName = conversions['DOMString'](name, {
    context: `Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': name (${name})`,
  });

  if (parsedName === '') {
    throw new DOMException(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': name is empty`, 'NotSupportedError');
  }

  if (nameProcessorCtorMap.has(name)) {
    throw new DOMException(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': A processor with name '${name}' has already been registered in this scope`, 'NotSupportedError');
  }

  if (!isConstructor(processorCtor)) {
    throw new TypeError(`Cannot execute 'registerProcessor")' in 'AudoWorkletGlobalScope': argument 2 for name '${name}' is not a constructor`);
  }

  if (typeof processorCtor.prototype !== 'object') {
    throw new TypeError(`Cannot execute 'registerProcessor")' in 'AudoWorkletGlobalScope': argument 2 for name '${name}' is not is not a valid AudioWorkletProcessor`);
  }

  // must support Array, Set or iterators
  let parameterDescriptorsValue = processorCtor.parameterDescriptors;

  if (!isIterable(parameterDescriptorsValue)) {
    throw new TypeError(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: 'parameterDescriptors' is not iterable'`);
  }

  const paramDescriptors = Array.from(parameterDescriptorsValue);
  const parsedParamDescriptors = [];

  // Parse AudioParamDescriptor sequence
  // cf. https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  for (let i = 0; i < paramDescriptors.length; i++) {
    const descriptor = paramDescriptors[i];
    const parsedDescriptor = {};

    if (typeof descriptor !== 'object' || descriptor === null) {
      throw new TypeError(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Element at index ${i} is not an instance of 'AudioParamDescriptor'`);
    }

    if (descriptor.name === undefined) {
      throw new TypeError(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Element at index ${i} is not an instance of 'AudioParamDescriptor'`);
    }

    parsedDescriptor.name = conversions['DOMString'](descriptor.name, {
      context: `Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'name' for 'AudioParamDescriptor' at index ${i}`,
    });

    if (descriptor.defaultValue !== undefined) {
      parsedDescriptor.defaultValue = conversions['float'](descriptor.defaultValue, {
        context: `Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'defaultValue' for 'AudioParamDescriptor' at index ${i}`,
      });
    } else {
      parsedDescriptor.defaultValue = 0;
    }

    if (descriptor.maxValue !== undefined) {
      parsedDescriptor.maxValue = conversions['float'](descriptor.maxValue, {
        context: `Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'maxValue' for 'AudioParamDescriptor' at index ${i}`,
      });
    } else {
      parsedDescriptor.maxValue = 3.4028235e38;
    }

    if (descriptor.minValue !== undefined) {
      parsedDescriptor.minValue = conversions['float'](descriptor.minValue, {
        context: `Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'minValue' for 'AudioParamDescriptor' at index ${i}`,
      });
    } else {
      parsedDescriptor.minValue = -3.4028235e38;
    }

    if (descriptor.automationRate !== undefined) {
      if (!['a-rate', 'k-rate'].includes(descriptor.automationRate)) {
        throw new TypeError(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: The provided value '${descriptor.automationRate}' is not a valid enum value of type AutomationRate for 'AudioParamDescriptor' at index ${i}`);
      }

      parsedDescriptor.automationRate = conversions['DOMString'](descriptor.automationRate, {
        context: `Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: The provided value '${descriptor.automationRate}'`,
      });
    } else {
      parsedDescriptor.automationRate = 'a-rate';
    }

    parsedParamDescriptors.push(parsedDescriptor);
  }

  // check for duplicate parame names and consistency of min, max and default values
  const paramNames = [];

  for (let i = 0; i < parsedParamDescriptors.length; i++) {
    const { name, defaultValue, minValue, maxValue } = parsedParamDescriptors[i];

    if (paramNames.includes(name)) {
      throw new DOMException(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}': 'AudioParamDescriptor' with name '${name}' already declared`, 'NotSupportedError');
    }

    paramNames.push(name);

    if (!(minValue <= defaultValue && defaultValue <= maxValue)) {
      throw new DOMException(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}': The constraint minValue <= defaultValue <= maxValue is not met`, 'InvalidStateError');
    }
  }

  // store constructor
  nameProcessorCtorMap.set(parsedName, processorCtor);
  // send param descriptors back to main thread
  parentPort.postMessage({
    cmd: 'node-web-audio-api:worlet:processor-registered',
    name: parsedName,
    parameterDescriptors: parsedParamDescriptors,
  });
};


// @todo - recheck this, not sure this is relevant in our case
// NOTE: Authors that register an event listener on the "message" event of this
// port should call close on either end of the MessageChannel (either in the
// AudioWorklet or the AudioWorkletGlobalScope side) to allow for resources to be collected.
// parentPort.on('exit', () => {
//   process.stdout.write('closing worklet');
// });

parentPort.on('message', event => {
  switch (event.cmd) {
    case 'node-web-audio-api:worklet:init': {
      const { workletId, processors, promiseId } = event;
      break;
    }
    case 'node-web-audio-api:worklet:exit': {
      clearImmediate(runLoopImmediateId);
      // properly exit audio worklet on rust side
      exit_audio_worklet_global_scope(workletId, processors);
      // exit process
      process.exit(0);
      break;
    }
    case 'node-web-audio-api:worklet:add-module': {
      const { code, promiseId } = event;
      const func = new Function('AudioWorkletProcessor', 'registerProcessor', code);
      func(AudioWorkletProcessor, registerProcessor);

      // send registered param descriptors on main thread and resolve Promise
      parentPort.postMessage({
        cmd: 'node-web-audio-api:worklet:module-added',
        promiseId,
      });
      break;
    }
    case 'node-web-audio-api:worklet:create-processor': {
      const { name, id, options, port } = event;
      const ctor = nameProcessorCtorMap.get(name);

      // rewrap options of interest for the AudioWorkletNodeBaseClass
      pendingProcessorConstructionData = {
        port,
        numberOfInputs: options.numberOfInputs,
        numberOfOutputs: options.numberOfOutputs,
        parameterDescriptors: ctor.parameterDescriptors,
      };

      let instance;

      try {
        instance = new ctor(options);
      } catch (err) {
        port.postMessage({ cmd: 'node-web-audio-api:worklet:ctor-error', err });
      }

      pendingProcessorConstructionData = null;
      // store in global so that Rust can match the JS processor
      // with its corresponding NapiAudioWorkletProcessor
      processors[`${id}`] = instance;
      // notify audio worklet back that processor has finished instanciation
      parentPort.postMessage({ cmd: 'node-web-audio-api:worklet:processor-created', id });

      if (!loopStarted) {
        loopStarted = true;
        setImmediate(runLoop);
      }
      break;
    }
  }
});
