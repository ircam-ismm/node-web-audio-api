// A JS synth voice for the render groups benchmark: sawtooth, one-pole lowpass, tanh drive
class Voice extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.phase = 0;
    this.step = options.processorOptions.frequency / sampleRate;
    this.low = 0;
    // DSP repetitions per sample, to weigh compute against the cost of a process call
    this.weight = options.processorOptions.weight ?? 1;
  }

  process(inputs, outputs) {
    const output = outputs[0][0];
    for (let i = 0; i < output.length; i++) {
      this.phase += this.step;
      if (this.phase >= 1) {
        this.phase -= 1;
      }
      const saw = 2 * this.phase - 1;
      let value = 0;
      for (let w = 0; w < this.weight; w++) {
        this.low += 0.05 * (saw - this.low);
        value += Math.tanh(3 * this.low);
      }
      output[i] = value / this.weight * 0.02;
    }
    return true;
  }
}

registerProcessor('voice', Voice);
