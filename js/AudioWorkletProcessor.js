import {
  kWorkletCallableProcess,
  kWorkletMarkNonCallableProcess,
  kWorkletInputs,
  kWorkletOutputs,
  kWorkletParams,
  kWorkletParamsCache,
  kWorkletGetBuffer,
  kWorkletGetBuffer1,
  kWorkletUnpackProcess,
} from './lib/audio-worklet/symbols.js';
import {
  pendingProcessorConstructionData,
} from './lib/audio-worklet/pending-processor-construction-data.js';

export class AudioWorkletProcessor {
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
    } = pendingProcessorConstructionData.inner;

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
          globalThis[kWorkletGetBuffer](),
          globalThis[kWorkletGetBuffer1](),
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
    // output must be filled with zero
    // cf. the-audioworklet-interface/audioworkletprocessor-unconnected-outputs.https.window.html
    outputs.forEach(output => {
      output.forEach(channel => channel.fill(0));
    });

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
