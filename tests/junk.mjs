import { AudioBuffer, AudioBufferSourceNode, AnalyserNode, AudioContext, ConvolverNode, DelayNode, GainNode, IIRFilterNode, OfflineAudioContext, StereoPannerNode, PeriodicWave, MediaStreamAudioSourceNode, WaveShaperNode, mediaDevices } from '../index.mjs';


// // const mediaStream = await mediaDevices.getUserMedia({ audio: true });
// // const context = new OfflineAudioContext(2, 1, 48000);
// // // // const node = new AudioBufferSourceNode(context, 42)
// // // // const src = context.createBufferSource();
// // // // src.start(NaN);
// // // new StereoPannerNode(context, {"channelCountMode":"max"});
// // // new StereoPannerNode(context, {"channelCount":3})

// // try {
// //   // new OfflineAudioContext({"length":42,"sampleRate":12345})
// //   // new PeriodicWave(context, { real : new Float32Array(8192), imag : new Float32Array(4) })
// //   const src = new MediaStreamAudioSourceNode(context, { mediaStream });
// //   console.log(src);
// // } catch (err) {
// //   console.log(err);
// // }

// // await context.startRendering();

// const SAMPLERATE = 8000;
// const LENGTH = 128;

const context = new AudioContext({ sampleRate: 48000 });
// const buffer = new AudioBuffer(1, 100, 48000);

const node0 = new IIRFilterNode(context, {"feedforward":[1],"feedback":[1,-0.9]})

// const a = new AudioBuffer

// const gain = new GainNode(null);

