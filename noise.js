console.log("white noise.js");

class WhiteNoiseProcessor /*extends AudioWorkletProcessor*/ {
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    });
    return true;
  }
}

// TODO cannot access parent scope
// registerProcessor('white-noise', WhiteNoiseProcessor);
