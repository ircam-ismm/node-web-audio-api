const {
  parentPort,
  workerData,
} = require('node:worker_threads');

const conversions = require('webidl-conversions');

const {
  run_audio_worklet,
} = require('../load-native.cjs');

const {
  workletId,
} = workerData;

const kHiddenOptions = Symbol('node-web-audio-api:worklet-hidden-options');
const kWorkletInputs = Symbol.for('node-web-audio-api:worklet-inputs');
const kWorkletOutputs = Symbol.for('node-web-audio-api:worklet-outputs');
const kWorkletParams = Symbol.for('node-web-audio-api:worklet-params');
// const kWorkletOrderedParamNames = Symbol.for('node-web-audio-api:worklet-ordered-param-names');

const nameProcessorCtorMap = new Map();
const paramDescriptorRegisteredMap = new Map();
let pendingProcessorConstructionData = null;
let loopStarted = false;
let breakLoop = false;
let immediateId = null;

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
  if (!breakLoop) {
    // block until we need to render a quantum
    run_audio_worklet(workletId);
    // yield to the event loop, and then repeat
    immediateId = setImmediate(runLoop);
  }
}

class AudioWorkletProcessor {
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

    this.#port = port;

    this[kWorkletInputs] = new Array(numberOfInputs).fill([]);
    // @todo - use `outputChannelCount`
    this[kWorkletOutputs] = new Array(numberOfOutputs).fill([]);
    this[kWorkletParams] = {};
    // prepare kWorkletParams object with parameter descriptors names
    parameterDescriptors.forEach(desc => {
      this[kWorkletParams][desc.name] = null;
    });
  }

  get port() {
    if (!(this instanceof AudioWorkletProcessor)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletProcessor\'');
    }

    return this.#port;
  }
}

// follow algorithm from:
// https://webaudio.github.io/web-audio-api/#dom-audioworkletglobalscope-registerprocessor
function registerProcessor(name, processorCtor) {
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
    throw new TypeError(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Processor for name '${name}' is not a constructor`);
  }

  if (typeof processorCtor.prototype !== 'object') {
    throw new TypeError(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Processor for name '${name}' is not a valid processor`);
  }

  // must support Array, Set or iterators
  let parameterDescriptorsValue = processorCtor.parameterDescriptors;

  if (!isIterable(parameterDescriptorsValue)) {
    throw new TypeError(`Cannot execute 'registerProcessor' in 'AudoWorkletGlobalScope': Invalid 'parameterDescriptors' for processor '${name}: 'parameterDescriptors' is not iterable'`);
  } else {
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

    // store to send back to AudioWorklet
    paramDescriptorRegisteredMap.set(parsedName, parsedParamDescriptors);
  }

  nameProcessorCtorMap.set(parsedName, processorCtor);
};


// @todo - recheck this, not sure this is relevant in our case
// NOTE: Authors that register an event listener on the "message" event of this
// port should call close on either end of the MessageChannel (either in the
// AudioWorklet or the AudioWorkletGlobalScope side) to allow for resources to be collected.
parentPort.on('exit', () => {
  process.stdout.write('closing worklet');
});

parentPort.on('message', event => {
  console.log(event.cmd + '\n');

  switch (event.cmd) {
    case 'node-web-audio-api:worklet:init': {
      const { workletId, promiseId } = event;
      break;
    }
    case 'node-web-audio-api:worklet:exit': {
      breakLoop = true;
      // run audio worklet on rust side to handle any pending incoming command
      run_audio_worklet(workletId);
      // delete all remaining processor instances
      process.exit(0);
      break;
    }
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
      pendingProcessorConstructionData = {
        port,
        numberOfInputs,
        numberOfOutputs,
        parameterDescriptors: ctor.parameterDescriptors,
      };

      let instance;

      try {
        instance = new ctor(processorOptions);
      } catch (err) {
        // @todo - send processor error
        console.log(err.message);
      }

      pendingProcessorConstructionData = null;
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
