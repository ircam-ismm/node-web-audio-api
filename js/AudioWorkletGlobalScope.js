import {
  parentPort,
  workerData,
  markAsUntransferable,
} from 'node:worker_threads';

import conversions from 'webidl-conversions';

import { AudioWorkletProcessor } from './AudioWorkletProcessor.js';
import { isIterable } from './lib/is-iterable.js';
import { isConstructor } from './lib/is-constructor.js';
import {
  kWorkletMarkNonCallableProcess,
  kWorkletGetBuffer,
  kWorkletGetBuffer1,
  kWorkletRecycleBuffer,
  kWorkletRecycleBuffer1,
  kWorkletMarkAsUntransferable,
} from './lib/audio-worklet/symbols.js';
import {
  pendingProcessor,
} from './lib/audio-worklet/pending-processor.js';
import {
  BufferPool,
} from './lib/audio-worklet/BufferPool.js';

import nativeBinding from '../load-native.js';
const {
  exit_audio_worklet_global_scope,
  run_audio_worklet_global_scope,
} = nativeBinding;

const {
  workletId,
  sampleRate,
  renderQuantumSize,
} = workerData;

// catch possible errors thrown in `onmessage` handlers that should not break the worker
process.on('uncaughtException', err => {
  console.log('AudioWorkletGlobalScope uncaughtException:', err);
});

const nameProcessorCtorMap = new Map();
const processors = {};
const bufferPoolRenderSize = new BufferPool(renderQuantumSize, 256);
const bufferPoolOne = new BufferPool(1, 64);
// Expose some function to be accessed from rust when IO layout changes
globalThis[kWorkletGetBuffer] = () => bufferPoolRenderSize.get();
globalThis[kWorkletGetBuffer1] = () => bufferPoolOne.get();
globalThis[kWorkletRecycleBuffer] = buffer => bufferPoolRenderSize.recycle(buffer);
globalThis[kWorkletRecycleBuffer1] = buffer => bufferPoolOne.recycle(buffer);
globalThis[kWorkletMarkAsUntransferable] = obj => {
  markAsUntransferable(obj);
  return obj;
};

let loopStarted = false;
let runLoopImmediateId = null;

function runLoop() {
  // block until we need to render a quantum
  run_audio_worklet_global_scope(workletId, processors);
  // yield to the event loop, and then repeat
  runLoopImmediateId = setImmediate(runLoop);
}

// AudioWorkletGlobalScope globals
globalThis.currentTime = 0;
globalThis.currentFrame = 0;
globalThis.sampleRate = sampleRate;
globalThis.renderQuantumSize = renderQuantumSize;
globalThis.AudioWorkletProcessor = AudioWorkletProcessor;
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
      pendingProcessor.constructionData = {
        messagePort,
        errorPort,
        numberOfInputs: options.numberOfInputs,
        numberOfOutputs: options.numberOfOutputs,
        parameterDescriptors: ctor.parameterDescriptors,
        errored: null,
      };

      let errored = false;

      try {
        pendingProcessor.instance = new ctor(options);
      } catch (err) {
        // if the given processor constructor failed, we create a dummy processor
        // that we mark immediately as non-callable. This prevents situations where
        // the NapiAudioWorkletProcessor, which already exists at this point, hangs
        // forever waiting for its JS counterpart
        // @todo - This design could be improved in the future by flagging somehow
        // the Rust processor to avoid the cross thread communication
        errored = true;

        if (!pendingProcessor.instance) {
          pendingProcessor.instance = new AudioWorkletProcessor(options);
          pendingProcessor.instance[kWorkletMarkNonCallableProcess](['node-web-audio-api:worklet:ctor-error', err]);
        }
      }

      if (!(typeof pendingProcessor.instance.process === 'function')) {
        const err = new TypeError(`Invalid AudioWorkletNode "${pendingProcessor.instance.constructor.name}": no process method found`);
        pendingProcessor.instance[kWorkletMarkNonCallableProcess](['node-web-audio-api:worklet:process-invalid', err]);
      }

      // store in global so that Rust can match the JS processor
      // with its corresponding NapiAudioWorkletProcessor
      processors[`${id}`] = pendingProcessor.instance;

      pendingProcessor.constructionData = null;
      pendingProcessor.instance = null;
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
