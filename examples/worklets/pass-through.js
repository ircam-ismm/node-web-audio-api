class PassThrough extends AudioWorkletProcessor {
  // this parameter is not used, by allows to ensure that the params buffers
  // recycling logic works as expected in `examples/offline-worklet.js`
  // cf. https://github.com/ircam-ismm/node-web-audio-api/issues/170
  static get parameterDescriptors() {
    return [
      {
        name: "dummy",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate",
      },
    ];
  }

  process(inputs, outputs) {
    if (inputs[0] && inputs[0][0] && outputs[0] && outputs[0][0]) {
      for (let ch = 0; ch < outputs[0].length; ch++) {
        if (inputs[0][ch]) {
          outputs[0][ch].set(inputs[0][ch]);
        }
      }
    }
    return true;
  }
}

registerProcessor('pass-through', PassThrough);
