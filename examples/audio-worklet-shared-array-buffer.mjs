import path from 'node:path';

import { AudioContext, AudioWorkletNode } from '../index.mjs';
import { sleep } from '@ircam/sc-utils';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

await audioContext.audioWorklet.addModule(path.join('examples', 'worklets', 'array-source.js'));

// Create a shared float array big enough for 128 floats
let sharedArray = new SharedArrayBuffer(512);
let sharedFloats = new Float32Array(sharedArray);

const src = new AudioWorkletNode(audioContext, 'array-source', {
  processorOptions: { sharedFloats },
});
src.connect(audioContext.destination);

console.log("Sawtooth");
for (let i = 0; i < sharedFloats.length; i++) {
    sharedFloats[i] = -1. + i / 64; // create saw
}
await sleep(2);

console.log("Square");
for (let i = 0; i < sharedFloats.length; i++) {
    sharedFloats[i] = i > 64 ? 1 : -1;
}
await sleep(2);

// @todo - this should close the AudioWorkletGlobalScope properly
// before closing the "real" context
await audioContext.close();
