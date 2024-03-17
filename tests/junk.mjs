import { AudioBuffer, AudioBufferSourceNode, AnalyserNode, AudioContext, ConvolverNode, DelayNode, GainNode, OfflineAudioContext, StereoPannerNode, PeriodicWave, MediaStreamAudioSourceNode, mediaDevices } from '../index.mjs';


// const mediaStream = await mediaDevices.getUserMedia({ audio: true });
// const context = new OfflineAudioContext(2, 1, 48000);
// // // const node = new AudioBufferSourceNode(context, 42)
// // // const src = context.createBufferSource();
// // // src.start(NaN);
// // new StereoPannerNode(context, {"channelCountMode":"max"});
// // new StereoPannerNode(context, {"channelCount":3})

// try {
//   // new OfflineAudioContext({"length":42,"sampleRate":12345})
//   // new PeriodicWave(context, { real : new Float32Array(8192), imag : new Float32Array(4) })
//   const src = new MediaStreamAudioSourceNode(context, { mediaStream });
//   console.log(src);
// } catch (err) {
//   console.log(err);
// }

// await context.startRendering();

const SAMPLERATE = 8000;
const LENGTH = 128;

const context = new AudioContext({ sampleRate: 1 });

// const _ = context.createBuffer(1, 1, context.sampleRate);
// console.log(_);
const buffer = new AudioBuffer({ length: 12, sampleRate: context.sampleRate });

let node;
try {
  node = new ConvolverNode(context, { buffer: null });
} catch (err) {}

console.log(node.buffer);
