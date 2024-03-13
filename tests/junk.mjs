import { AudioBufferSourceNode, AnalyserNode, AudioContext, GainNode, OfflineAudioContext, StereoPannerNode, PeriodicWave, MediaStreamAudioSourceNode, mediaDevices } from '../index.mjs';


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


var buf = oac.createBuffer(1, LENGTH, SAMPLERATE)
var bs = new AudioBufferSourceNode(oac);
var channelData = buf.getChannelData(0);
for (var i = 0; i < channelData.length; i++) {
  channelData[i] = 1.0;
}
bs.buffer = null;
bs.start(); // This does not acquire the content
bs.buffer = buf; // This does
for (var i = 0; i < channelData.length; i++) {
  channelData[i] = 0.5;
}
// allSamplesAtOne(buf, "reading back");
bs.connect(oac.destination);
const output = await oac.startRendering();
