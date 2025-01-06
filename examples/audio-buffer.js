import assert from 'node:assert';
import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

// create a 1 second buffer filled with a sine at 200Hz
console.log('> Play sine at 200Hz created manually in an AudioBuffer');

const numberOfChannels = 1;
const length = audioContext.sampleRate;
const sampleRate = audioContext.sampleRate;
const buffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

// // this works as expected but should be tested carefully, relies on unsafe code
// const channel = buffer.getChannelData(0);
// for (let i = 0; i < channel.length; i++) {
//   channel[i] = i;
// }
// console.log(channel);
// console.log(buffer.getChannelData(0));
// process.exit(0);

const sine = new Float32Array(length);

for (let i = 0; i < length; i++) {
  let phase = i / length * 2. * Math.PI * 200.;
  sine[i] = Math.sin(phase);
}

buffer.copyToChannel(sine, 0);

{
  const test = new Float32Array(length);
  buffer.copyFromChannel(test, 0);
  assert.deepStrictEqual(sine, test);
}

// play the buffer in a loop
const src = audioContext.createBufferSource();
src.buffer = buffer;
src.loop = true;
src.connect(audioContext.destination);
src.start(audioContext.currentTime);
src.stop(audioContext.currentTime + 3.);

await new Promise(resolve => setTimeout(resolve, 3.5 * 1000));

// play a sine at 200Hz
console.log('> Play sine at 200Hz from an OscillatorNode');

let osc = audioContext.createOscillator();
osc.frequency.value = 200.;
osc.connect(audioContext.destination);
osc.start(audioContext.currentTime);
osc.stop(audioContext.currentTime + 3.);

await new Promise(resolve => setTimeout(resolve, 3.5 * 1000));

await audioContext.close();
