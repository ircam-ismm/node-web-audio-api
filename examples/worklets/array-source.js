class ArraySourceProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.sharedFloats = options.processorOptions.sharedFloats;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];

    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = this.sharedFloats[i];
      }
    });

    return true;
  }
}

registerProcessor('array-source', ArraySourceProcessor);
