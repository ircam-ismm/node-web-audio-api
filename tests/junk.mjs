import { AudioBuffer, AudioBufferSourceNode, AnalyserNode, AudioContext, DelayNode, GainNode, OfflineAudioContext, StereoPannerNode, PeriodicWave, MediaStreamAudioSourceNode, mediaDevices } from '../index.mjs';


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

const oac = new OfflineAudioContext(1, LENGTH, SAMPLERATE);

// var buf = oac.createBuffer(1, LENGTH, SAMPLERATE)
// var bs = new AudioBufferSourceNode(oac);
// var channelData = buf.getChannelData(0);
// for (var i = 0; i < channelData.length; i++) {
//   channelData[i] = 1.0;
// }
// bs.buffer = buf;
// bs.start(); // This acquires the content since buf is not null
// for (var i = 0; i < channelData.length; i++) {
//   channelData[i] = 0.5;
// }
// // allSamplesAtOne(buf, "reading back");
// bs.connect(oac.destination);
// const output = await oac.startRendering();

let off = new OfflineAudioContext(1, 512, 48000);
let b = new AudioBuffer({sampleRate: off.sampleRate, length: 1});
b.getChannelData(0)[0] = 1;
let impulse = new AudioBufferSourceNode(off, {buffer: b});
impulse.start(0);
// This delayTime of 64 samples MUST be clamped to 128 samples when
// in a cycle.
let delay = new DelayNode(off, {delayTime: 64 / 48000});
let fb = new GainNode(off);
impulse.connect(fb).connect(delay).connect(fb).connect(off.destination);

off.startRendering().then((b) => {
  // return Promise.resolve(b.getChannelData(0));
  console.log(b.getChannelData(0));
})
