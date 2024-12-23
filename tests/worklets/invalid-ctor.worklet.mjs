class InvalidCtor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.stuff = invalid;
  }

  process(inputs, outputs, parameters) {
    return true;
  }
}

registerProcessor('invalid-ctor', InvalidCtor);
