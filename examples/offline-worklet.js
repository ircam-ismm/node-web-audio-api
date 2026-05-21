import {
  AudioContext,
  AudioBufferSourceNode,
  AudioWorkletNode,
  OfflineAudioContext,
} from '#node-web-audio-api';

import { sleep } from '@ircam/sc-utils';

console.log('> Process 1 sec sine piped into "pass-through" worklet');

const offline = new OfflineAudioContext(2, 48000, 48000);
await offline.audioWorklet.addModule('./worklets/pass-through.js');

const osc = offline.createOscillator();
const passThrough = new AudioWorkletNode(offline, 'pass-through');

osc.connect(passThrough).connect(offline.destination);
osc.start(0);
osc.stop(1);

const buffer = await offline.startRendering();

console.log(`> Playback resulting buffer (duration: ${buffer.duration}sec)`);

const online = new AudioContext({ sampleRate: 48000 });
const src = new AudioBufferSourceNode(online, { buffer });
src.connect(online.destination);
src.start();

await sleep(1);

await online.close();
