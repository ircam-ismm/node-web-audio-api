class InvalidProcess extends AudioWorkletProcessor {
  // attribute exists but is not callbable
  process = null
}

registerProcessor('invalid-process', InvalidProcess);

class ProcessThrows extends AudioWorkletProcessor {
  // attribute exists but is not callbable
  process = (inputs, outputs, params) => {
    outputs[3][1] = 'throws';
  }
}

registerProcessor('process-throws', ProcessThrows);
