import { AudioContext, GainNode, AnalyserNode, AudioParam } from '../index.mjs';

const audioContext = new AudioContext({});

try {
  new GainNode();
} catch (err) {
  console.log(err);
}

try {
  new GainNode(1);
} catch (err) {
  console.log(err);
}

try {
  new GainNode(audioContext, 42);
} catch (err) {
  console.log(err);
}

// this hsould not throw
try {
  new GainNode(audioContext);
} catch (err) {
  console.log(err);
}

try {
  new GainNode(audioContext, { gain: 0.1 });
} catch (err) {
  console.log(err);
}

try {
  new GainNode(audioContext, null);
} catch (err) {
  console.log(err);
}

// check audio param
try {
  const node = new GainNode(audioContext);

  console.log(node.gain instanceof AudioParam);
} catch (err) {
  console.log(err);
}


// try {
//   new AnalyserNode(audioContext)
// } catch (err) {
//   console.log(err);
// }

// try {
//   new AnalyserNode(audioContext, {"minDecibels":-10,"maxDecibels":20})
// } catch (err) {
//   console.log(err);
// }

// try {
//   new AnalyserNode(audioContext, {"minDecibels":-10,"maxDecibels":20})
// } catch (err) {
//   console.log(err);
// }

audioContext.close();
// src.connect(gain);
// src.disconnect({});
