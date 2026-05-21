class NoiseGenerator extends AudioWorkletProcessor {
  process(_, outputs) {
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; ++i) {
        outputChannel[i] = 2 * Math.random() - 1;
      }
    }

    return true;
  }
}

registerProcessor('noise-generator', NoiseGenerator);
