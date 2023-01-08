import assert from 'node:assert';
import { AudioContext } from '../index.mjs';

const context = new AudioContext();

// create a 1 second buffer filled with a sine at 200Hz
console.log('> Play sine at 200Hz created manually in an AudioBuffer');

const numberOfChannels = 1;
const length = context.sampleRate;
const sampleRate = context.sampleRate;
const buffer = context.createBuffer(numberOfChannels, length, sampleRate);
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
const src = context.createBufferSource();
src.buffer = buffer;
src.loop = true;
src.connect(context.destination);
src.start(context.currentTime);
src.stop(context.currentTime + 3.);

await new Promise(resolve => setTimeout(resolve, 3.5 * 1000));

// play a sine at 200Hz
console.log('> Play sine at 200Hz from an OscillatorNode');

let osc = context.createOscillator();
osc.frequency.value = 200.;
osc.connect(context.destination);
osc.start(context.currentTime);
osc.stop(context.currentTime + 3.);

await new Promise(resolve => setTimeout(resolve, 3.5 * 1000));

context.close();
