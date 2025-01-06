import fs from 'node:fs';
import path from 'node:path';
import { AudioContext } from '../index.mjs';

// use part of cosine, between [π, 2π] as shaping cureve
function makeDistortionCurve(size) {
  const curve = new Float32Array(size);
  let phase = 0.;
  const phaseIncr = Math.PI / (size - 1);

  for (let i = 0; i < size; i++) {
    curve[i] = Math.cos(Math.PI + phase);
    phase += phaseIncr;
  }

  return curve;
}


console.log('> gradually increase the amount of distortion applied on the sample');

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

let file = fs.readFileSync(path.join('examples', 'samples', 'sample.wav')).buffer;
let buffer = await audioContext.decodeAudioData(file);
let curve = makeDistortionCurve(2048);

let postGain = audioContext.createGain();
postGain.connect(audioContext.destination);
postGain.gain.value = 0.;

let shaper = audioContext.createWaveShaper();
shaper.curve = curve;
shaper.oversample = 'none';
// shaper.oversample = "2x";
// shaper.oversample = "4x";
shaper.connect(postGain);

let preGain = audioContext.createGain();
preGain.connect(shaper);
preGain.gain.value = 0.;

for (let i = 1; i < 7; i++) {
  const gain = i * 2.;
  console.log('+ pre gain:', gain);

  preGain.gain.value = gain;
  postGain.gain.value = 1. / gain;

  let src = audioContext.createBufferSource();
  src.connect(preGain);
  src.buffer = buffer;
  src.start();

  await new Promise(resolve => setTimeout(resolve, 4000));
}

await audioContext.close();
