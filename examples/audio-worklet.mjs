import path from 'node:path';

import { AudioContext, OscillatorNode, AudioWorkletNode } from '../index.mjs';
import { sleep } from '@ircam/sc-utils';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

// @todo - only relative to cwd for now, should support absolute and relative to caller pathnames
const workletPathname = path.join('examples', 'worklets', 'bitcrusher.js');
await audioContext.audioWorklet.addModule(workletPathname);

const sine = new OscillatorNode(audioContext, { type: 'sawtooth', frequency: 5000 });
const bitCrusher = new AudioWorkletNode(audioContext, 'bitcrusher', {
  processorOptions: { msg: 'hello world' },
});

bitCrusher.port.on('message', (event) => console.log('main recv', event));
bitCrusher.port.postMessage({ hello: 'from main' });

sine
  .connect(bitCrusher)
  .connect(audioContext.destination);

const paramBitDepth =  bitCrusher.parameters.bitDepth;
const paramReduction =  bitCrusher.parameters.frequencyReduction;

paramBitDepth.setValueAtTime(1, 0);

paramReduction.setValueAtTime(0.01, 0.);
paramReduction.linearRampToValueAtTime(0.1, 4.);
paramReduction.exponentialRampToValueAtTime(0.01, 8.);

sine.start();
sine.stop(8);

await sleep(8);

// @todo - this should close the AudioWorkletGlobalScope properly
// before closing the "real" context
await audioContext.close();
