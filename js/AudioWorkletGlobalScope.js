const {
  parentPort,
  workerData,
  markAsUntransferable,
} = require('node:worker_threads');

const conversions = require('webidl-conversions');

// these function are defined on the rust side
const {
  exit_audio_worklet_global_scope,
  run_audio_worklet_global_scope,
} = require('../load-native.cjs');

const {
  workletId,
  sampleRate,
} = workerData;

const kWorkletCallableProcess = Symbol.for('node-web-audio-api:worklet-callable-process');
const kWorkletMarkNonCallableProcess = Symbol.for('node-web-audio-api:worklet-mark-non-callable-process');
const kWorkletInputs = Symbol.for('node-web-audio-api:worklet-inputs');
const kWorkletOutputs = Symbol.for('node-web-audio-api:worklet-outputs');
const kWorkletParams = Symbol.for('node-web-audio-api:worklet-params');
const kWorkletParamsCache = Symbol.for('node-web-audio-api:worklet-params-cache');
const kWorkletGetBuffer = Symbol.for('node-web-audio-api:worklet-get-buffer');
const kWorkletRecycleBuffer = Symbol.for('node-web-audio-api:worklet-recycle-buffer');
const kWorkletRecycleBuffer1 = Symbol.for('node-web-audio-api:worklet-recycle-buffer-1');
const kWorkletMarkAsUntransferable = Symbol.for('node-web-audio-api:worklet-mark-as-untransferable');
const kWorkletUnpackProcess = Symbol.for('node-web-audio-api:worklet-unpack-process');

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
    // Mark underlying buffer as untransferable too, this will fail one of
    // the task in `audioworkletprocessor-process-frozen-array.https.html`
    // but prevent segmentation fault
    markAsUntransferable(float32.buffer);

    return float32;
  }

  get size() {
    return this.#pool.length;
  }

  get() {
    if (this.#pool.length === 0) {
      return this.#allocate();
    }

    return this.#pool.pop();
  }

  recycle(buffer) {
    // make sure we can't pollute the pool
    if (buffer.length === this.#bufferSize) {
      this.#pool.push(buffer);
    }
  }
}

const renderQuantumSize = 128;

const pool128 = new BufferPool(renderQuantumSize, 256);
const pool1 = new BufferPool(1, 64);
// Expose some function to be accessed from rust when io layout changes
// @todo - possibly transfer while IO layout change to JS to minimize language boundaries crossing
globalThis[kWorkletGetBuffer] = () => pool128.get();
globalThis[kWorkletRecycleBuffer] = buffer => pool128.recycle(buffer);
globalThis[kWorkletRecycleBuffer1] = buffer => pool1.recycle(buffer);
globalThis[kWorkletMarkAsUntransferable] = obj => {
  markAsUntransferable(obj);
  return obj;
};

function isIterable(obj) {
  if (obj === null || obj === undefined) {
    return false;
  }

  return typeof obj[Symbol.iterator] === 'function';
}

// cf. https://stackoverflow.com/a/46759625
function isConstructor(f) {
  try {
    Reflect.construct(String, [], f);
  } catch {
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

// catch errors thrown in `onmessage` handlers that should not break the worker
process.on('uncaughtException', (err, origin) => {
	console.log('AudioWorkletGlobalScope uncaughtException:', err);
});

globalThis.currentTime = 0;
globalThis.currentFrame = 0;
globalThis.sampleRate = sampleRate;
globalThis.renderQuantumSize = renderQuantumSize;

globalThis.AudioWorkletProcessor = class AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  #messagePort = null;
  #errorPort = null;

  constructor() {
    const {
      messagePort,
      errorPort,
      numberOfInputs,
      numberOfOutputs,
      parameterDescriptors,
    } = pendingProcessorConstructionData;

    this.#messagePort = messagePort;
    this.#errorPort = errorPort;

    // Mark [[callable process]] as true, set to false in render quantum
    // either if "process" does not exists or if it throws an error
    this[kWorkletCallableProcess] = true;

    // We don't want the factory handle errors that could occur here, e.g. pollution of global objects
    // cf. the-audioworklet-interface/audioworkletprocessor-param-getter-overridden.https.html
    // Note that the logic of this WPT test needs to be understood more precisely, it passes but
    // not for the reason explained
    try {
      // Populate with dummy values which will be replaced in first render call
      this[kWorkletInputs] = new Array(numberOfInputs).fill([]);
      this[kWorkletOutputs] = new Array(numberOfOutputs).fill([]);
      // Object to be reused as `process` parameters argument
      this[kWorkletParams] = {};
      // Cache of 2 Float32Array (of length 128 and 1) for each param, to be reused on
      // each process call according to the size the param for the current render quantum
      this[kWorkletParamsCache] = {};

      for (let desc of parameterDescriptors) {
        this[kWorkletParamsCache][desc.name] = [
          pool128.get(),
          pool1.get(),
        ];
      }
    } catch (err) {
      this[kWorkletMarkNonCallableProcess](['node-web-audio-api:worklet:ctor-error', err]);
    }
  }

  get port() {
    if (!(this instanceof AudioWorkletProcessor)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletProcessor\'');
    }

    return this.#messagePort;
  }

  // Wrapper around the "real" process method that allows to
  // - unpack arguments from napi-rs `apply`
  // - cast return value to boolean
  // - catch and cleanly return error so that rust can properly handle it
  //
  // This method is called only if a "real" process method has been found
  [kWorkletUnpackProcess]([inputs, outputs, parameters]) {
    try {
      return !!this.process(inputs, outputs, parameters);
    } catch (err) {
      return err;
    }
  }

  [kWorkletMarkNonCallableProcess]([cmd, err]) {
    this[kWorkletCallableProcess] = false;
    this.#errorPort.postMessage({ cmd, err });
  }
};

// Algorithm: https://webaudio.github.io/web-audio-api/#dom-audioworkletglobalscope-registerprocessor
globalThis.registerProcessor = function registerProcessor(name, processorCtor) {
  const parsedName = conversions['DOMString'](name, {
    context: `Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': name (${name})`,
  });

  if (parsedName === '') {
    throw new DOMException(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': name is empty`, 'NotSupportedError');
  }

  if (nameProcessorCtorMap.has(name)) {
    throw new DOMException(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': A processor with name '${name}' has already been registered in this scope`, 'NotSupportedError');
  }

  if (!isConstructor(processorCtor)) {
    throw new TypeError(`Cannot execute 'registerProcessor")' in 'AudioWorkletGlobalScope': argument 2 for name '${name}' is not a constructor`);
  }

  if (typeof processorCtor.prototype !== 'object') {
    throw new TypeError(`Cannot execute 'registerProcessor")' in 'AudioWorkletGlobalScope': argument 2 for name '${name}' is not is not a valid AudioWorkletProcessor`);
  }

  // must support Array, Set or iterators
  let parameterDescriptorsValue = processorCtor.parameterDescriptors;

  if (!isIterable(parameterDescriptorsValue)) {
    throw new TypeError(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: 'parameterDescriptors' is not iterable'`);
  }

  const paramDescriptors = Array.from(parameterDescriptorsValue);
  const parsedParamDescriptors = [];

  // Parse AudioParamDescriptor sequence
  // cf. https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  for (let i = 0; i < paramDescriptors.length; i++) {
    const descriptor = paramDescriptors[i];
    const parsedDescriptor = {};

    if (typeof descriptor !== 'object' || descriptor === null) {
      throw new TypeError(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Element at index ${i} is not an instance of 'AudioParamDescriptor'`);
    }

    if (descriptor.name === undefined) {
      throw new TypeError(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Element at index ${i} is not an instance of 'AudioParamDescriptor'`);
    }

    parsedDescriptor.name = conversions['DOMString'](descriptor.name, {
      context: `Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'name' for 'AudioParamDescriptor' at index ${i}`,
    });

    if (descriptor.defaultValue !== undefined) {
      parsedDescriptor.defaultValue = conversions['float'](descriptor.defaultValue, {
        context: `Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'defaultValue' for 'AudioParamDescriptor' at index ${i}`,
      });
    } else {
      parsedDescriptor.defaultValue = 0;
    }

    if (descriptor.maxValue !== undefined) {
      parsedDescriptor.maxValue = conversions['float'](descriptor.maxValue, {
        context: `Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'maxValue' for 'AudioParamDescriptor' at index ${i}`,
      });
    } else {
      parsedDescriptor.maxValue = 3.4028235e38;
    }

    if (descriptor.minValue !== undefined) {
      parsedDescriptor.minValue = conversions['float'](descriptor.minValue, {
        context: `Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: Invalid 'minValue' for 'AudioParamDescriptor' at index ${i}`,
      });
    } else {
      parsedDescriptor.minValue = -3.4028235e38;
    }

    if (descriptor.automationRate !== undefined) {
      if (!['a-rate', 'k-rate'].includes(descriptor.automationRate)) {
        throw new TypeError(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: The provided value '${descriptor.automationRate}' is not a valid enum value of type AutomationRate for 'AudioParamDescriptor' at index ${i}`);
      }

      parsedDescriptor.automationRate = conversions['DOMString'](descriptor.automationRate, {
        context: `Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: The provided value '${descriptor.automationRate}'`,
      });
    } else {
      parsedDescriptor.automationRate = 'a-rate';
    }

    parsedParamDescriptors.push(parsedDescriptor);
  }

  // check for duplicate param names and consistency of min, max and default values
  const paramNames = [];

  for (let i = 0; i < parsedParamDescriptors.length; i++) {
    const { name, defaultValue, minValue, maxValue } = parsedParamDescriptors[i];

    if (paramNames.includes(name)) {
      throw new DOMException(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}': 'AudioParamDescriptor' with name '${name}' already declared`, 'NotSupportedError');
    }

    paramNames.push(name);

    if (!(minValue <= defaultValue && defaultValue <= maxValue)) {
      throw new DOMException(`Cannot execute 'registerProcessor' in 'AudioWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}': The constraint minValue <= defaultValue <= maxValue is not met`, 'InvalidStateError');
    }
  }

  // store constructor
  nameProcessorCtorMap.set(parsedName, processorCtor);
  // send worklet name and param descriptors back to main thread
  parentPort.postMessage({
    cmd: 'node-web-audio-api:worklet:processor-registered',
    name: parsedName,
    parameterDescriptors: parsedParamDescriptors,
  });
};

parentPort.on('message', async event => {
  switch (event.cmd) {
    case 'node-web-audio-api:worklet:enter': {
      const { port, promiseId } = event;
      globalThis.port = port;

      parentPort.postMessage({
        cmd: 'node-web-audio-api:worklet:enter-ack',
        promiseId,
      });
      break;
    }
    case 'node-web-audio-api:worklet:exit': {
      clearImmediate(runLoopImmediateId);
      exit_audio_worklet_global_scope(workletId);
      process.exit(0);
      break;
    }
    case 'node-web-audio-api:worklet:add-module': {
      const { moduleUrl, code, promiseId } = event;

      try {
        // 1. If given module is a "real" file, we can import it as is,
        // 2. If module is a blob or loaded from an URL, we use the raw text as
        //    input. In this case, if the module uses an `import` it will crash
        if (moduleUrl !== null) {
          await import(moduleUrl);
        } else {
          await import(`data:text/javascript;base64,${btoa(unescape(encodeURIComponent(code)))}`);
        }

        parentPort.postMessage({
          cmd: 'node-web-audio-api:worklet:add-module-success',
          promiseId,
        });
      } catch (err) {
        parentPort.postMessage({
          cmd: 'node-web-audio-api:worklet:add-module-failed',
          promiseId,
          err,
        });
      }
      break;
    }
    case 'node-web-audio-api:worklet:create-processor': {
      const { name, id, options, messagePort, errorPort } = event;
      const ctor = nameProcessorCtorMap.get(name);

      // entities of interest for the AudioWorkletProcess base class
      pendingProcessorConstructionData = {
        messagePort,
        errorPort,
        numberOfInputs: options.numberOfInputs,
        numberOfOutputs: options.numberOfOutputs,
        parameterDescriptors: ctor.parameterDescriptors,
      };

      let instance;
      let errored = false;

      try {
        instance = new ctor(options);
      } catch (err) {
        // if the given processor constructor failed, we create a dummy processor
        // that we mark immediately as non-callable. This prevents situations where
        // the NapiAudioWorkletProcessor, which already exists at this point, hangs
        // forever waiting for its JS counterpart
        // @todo - This design could be improved in the future by flagging somehow
        // the Rust processor to avoid the cross thread communication
        errored = true;
        instance = new AudioWorkletProcessor(options);
        instance[kWorkletMarkNonCallableProcess](['node-web-audio-api:worklet:ctor-error', err]);
      }

      pendingProcessorConstructionData = null;
      // store in global so that Rust can match the JS processor
      // with its corresponding NapiAudioWorkletProcessor
      processors[`${id}`] = instance;
      // notify main thread that instantiation has finished somehow
      if (errored) {
        parentPort.postMessage({ cmd: 'node-web-audio-api:worklet:ctor-error', id });
      } else {
        parentPort.postMessage({ cmd: 'node-web-audio-api:worklet:processor-created', id });
      }

      if (!loopStarted) {
        loopStarted = true;
        setImmediate(runLoop);
      }
      break;
    }
  }
});

