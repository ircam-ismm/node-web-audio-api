import path from 'node:path';

import { AudioContext, OfflineAudioContext, OscillatorNode, AudioWorkletNode } from '../index.mjs';
import { sleep } from '@ircam/sc-utils';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const TEST_ONLINE = false;

const audioContext = TEST_ONLINE
  ? new AudioContext({ latencyHint })
  : new OfflineAudioContext(2, 2 * 48000, 48000);

await audioContext.audioWorklet.addModule(path.join('worklets', 'white-noise.js')); // relative path to call site

const whiteNoise = new AudioWorkletNode(audioContext, 'white-noise');
// whiteNoise.port.on('message', msg => console.log('message:', msg));
// whiteNoise.addEventListener('processorerror', err => console.log('processorerror:', err));
whiteNoise.connect(audioContext.destination);

if (TEST_ONLINE) {
  audioContext.renderCapacity.addEventListener('update', e => {
    const { timestamp, averageLoad, peakLoad, underrunRatio } = e;
    console.log('AudioRenderCapacityEvent:', { timestamp, averageLoad, peakLoad, underrunRatio });
  });
  audioContext.renderCapacity.start({ updateInterval: 1. });

  await sleep(2);
  console.log('close context (exit AudioWorkletGlobalScope)');
  await audioContext.close();
  await sleep(1);
  console.log('exit process');
} else {
  const buffer = await audioContext.startRendering();
  const online = new AudioContext();
  const src = online.createBufferSource();
  src.buffer = buffer;
  src.connect(online.destination);
  src.start();

  await sleep(2);
  await online.close();
  await sleep(2);
}
