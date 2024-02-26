import { AudioBufferSourceNode, AnalyserNode, AudioContext, GainNode, OfflineAudioContext, StereoPannerNode, mediaDevices, PeriodicWave, AudioBuffer } from '../index.mjs';

const context = new OfflineAudioContext(2, 1, 48000);
// // const node = new AudioBufferSourceNode(context, 42)
// // const src = context.createBufferSource();
// // src.start(NaN);
// new StereoPannerNode(context, {"channelCountMode":"max"});
// new StereoPannerNode(context, {"channelCount":3})

try {
  // new OfflineAudioContext({"length":42,"sampleRate":12345})
  // new PeriodicWave(context, { real : new Float32Array(8192), imag : new Float32Array(4) })
  const buffer = context.createBuffer(4, 88200, 44100);
  buffer.copyFromChannel(new Float32Array([0, 1]), -1);
} catch (err) {
  console.log(err);
}

await context.startRendering();
