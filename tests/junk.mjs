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
const testLength = 8192;
// real and imag are used in separate PeriodicWaves to make their peak values
// easy to determine.
const realMax = 99;
var real = new Float32Array(realMax + 1);
real[1] = 2.0; // fundamental
real[realMax] = 3.0;
const realPeak = real[1] + real[realMax];
const realFundamental = 19.0;
var imag = new Float32Array(4);
imag[0] = 6.0; // should be ignored.
imag[3] = 0.5;
const imagPeak = imag[3];
const imagFundamental = 551.0;

let context = new OfflineAudioContext(2, testLength, 44100);
// Create the expected output buffer
let expectations = context.createBuffer(2, testLength, context.sampleRate);
for (var i = 0; i < expectations.length; ++i) {

  expectations.getChannelData(0)[i] = 1.0 / realPeak *
    (real[1] * Math.cos(2 * Math.PI * realFundamental * i /
                        context.sampleRate) +
     real[realMax] * Math.cos(2 * Math.PI * realMax * realFundamental * i /
                        context.sampleRate));

  expectations.getChannelData(1)[i] = 1.0 / imagPeak *
     imag[3] * Math.sin(2 * Math.PI * 3 * imagFundamental * i /
                        context.sampleRate);
}

// Create the real output buffer
let merger = context.createChannelMerger();

let osc1 = context.createOscillator();
let osc2 = context.createOscillator();

osc1.setPeriodicWave(context.createPeriodicWave(
                        real, new Float32Array(real.length)));
osc2.setPeriodicWave(context.createPeriodicWave(
                        new Float32Array(imag.length), imag));
osc1.frequency.value = realFundamental;
osc2.frequency.value = imagFundamental;

osc1.start();
osc2.start();

osc1.connect(merger, 0, 0);
osc2.connect(merger, 0, 1);

context.startRendering().then(reality => {
  console.log(reality);
  console.log(expectations);
});
