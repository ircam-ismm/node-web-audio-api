import { markAsUntransferable } from 'node:worker_threads';

import {
  kWorkletCallableProcess,
  kWorkletMarkNonCallableProcess,
  kWorkletInputs,
  kWorkletOutputs,
  kWorkletParams,
  kWorkletParamsBuffer,
  kWorkletParamsNames,
  kWorkletParamsViews,
  kWorkletUnpackProcess,
} from './lib/audio-worklet/symbols.js';
import {
  pendingProcessor,
} from './lib/audio-worklet/pending-processor.js';

export class AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  #messagePort = null;
  #errorPort = null;

  constructor() {
    // check that this constructor has never been called for this processor instantiation
    // cf. wpt/webaudio/the-audio-api/the-audioworklet-interface/processor-construction-port.https.html
    if (pendingProcessor.super !== null) {
      this[kWorkletCallableProcess] = false;
      throw new TypeError(`Cannot construct "${this.constructor.name}": Invalid pending construction data`);
    }

    const {
      messagePort,
      errorPort,
      numberOfInputs,
      numberOfOutputs,
      parameterDescriptors,
    } = pendingProcessor.constructionData;

    this.#messagePort = messagePort;
    this.#errorPort = errorPort;

    pendingProcessor.super = this;

    // Mark [[callable process]] as true, set to false in render quantum
    // either if "process" does not exists or if it throws an error
    this[kWorkletCallableProcess] = true;

    // We don't want the factory handle errors that could occur here, e.g. pollution of global objects
    // cf. the-audioworklet-interface/audioworkletprocessor-param-getter-overridden.https.html
    // Note that the logic of this WPT test needs to be understood more precisely, it passes but
    // not for the reason explained
    try {
      // Populate with dummy values which will be replaced in first render call
      this[kWorkletInputs] = Object.freeze(new Array(numberOfInputs).fill(Object.freeze([])));
      this[kWorkletOutputs] = Object.freeze(new Array(numberOfOutputs).fill(Object.freeze([])));
      // Object to be reused as `process` parameters argument
      this[kWorkletParams] = {};
      // Values of all params in one buffer filled from rust, `renderQuantumSize + 1`
      // values per param in descriptor order. Each param has 2 views on it, a full
      // render quantum and a single value, and `parameters[name]` is pointed to the
      // one matching the size of the param in the current render quantum
      const { renderQuantumSize } = globalThis;
      const stride = renderQuantumSize + 1;
      const paramsBuffer = new Float32Array(parameterDescriptors.length * stride);
      // rust writes into this memory, it must never be detached
      markAsUntransferable(paramsBuffer.buffer);
      this[kWorkletParamsBuffer] = paramsBuffer;
      this[kWorkletParamsNames] = [];
      this[kWorkletParamsViews] = [];

      parameterDescriptors.forEach((desc, index) => {
        const offset = index * stride;
        const block = paramsBuffer.subarray(offset, offset + renderQuantumSize);
        const single = paramsBuffer.subarray(offset + renderQuantumSize, offset + stride);
        markAsUntransferable(block);
        markAsUntransferable(single);

        this[kWorkletParamsNames].push(desc.name);
        this[kWorkletParamsViews].push(block, single);
      });
    } catch (err) {
      this[kWorkletMarkNonCallableProcess]('node-web-audio-api:worklet:ctor-error', err);
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
  // - catch and propagate error while keeping the rust side clean
  // This method is called only if a "real" process attribute has been found at construction
  // However if this is the first call we don't know yet if process is callable
  [kWorkletUnpackProcess]([inputs, outputs, parameters]) {
    try {
      return !!this.process(inputs, outputs, parameters);
    } catch (err) {
      // we can just mark the process as non callable here and return false
      // (no need to return the error to rust and have another rust / js roundtrip)
      let error;
      // make sure we propagate an error instance, i.e. support `throw "my message";`
      // @note that `Error.isError` is not available in Node v22
      if (!(err instanceof Error)) {
        error = new Error(err);
      } else {
        error = err;
      }

      this[kWorkletMarkNonCallableProcess]('node-web-audio-api:worklet:process-error', error);

      return false;
    }
  }

  [kWorkletMarkNonCallableProcess](cmd, err) {
    this[kWorkletCallableProcess] = false;
    this.#errorPort.postMessage({ cmd, err });
  }
};
