import path from 'node:path';

import { AudioWorkletNode, OfflineAudioContext } from '#node-web-audio-api';

// Render 8 tracks of 8 JS worklet voices offline, with the tracks spread over render groups
// (non-standard `setRenderGroup`) rendered on several threads (`renderThreads`).
//
// `node render-groups-benchmark.js [DSP weight, default 1]`
//
// Each render thread pairs with the Worker of the group it renders, so a pair takes about two
// cores: keep groups at most equal to threads, and threads at most half the cores.

const TRACKS = 8;
const VOICES = 8;
const SECONDS = 5;
const weight = Number(process.argv[2] ?? 1);

const configs = [
  { groups: 0, threads: 1 },
  { groups: 2, threads: 2 },
  { groups: 4, threads: 4 },
  { groups: 8, threads: 4 },
];

for (const { groups, threads } of configs) {
  const context = new OfflineAudioContext({
    numberOfChannels: 1,
    length: 48000 * SECONDS,
    sampleRate: 48000,
    renderThreads: threads,
  });
  await context.audioWorklet.addModule(path.join('worklets', 'voice.js'));

  for (let track = 0; track < TRACKS; track++) {
    if (groups > 0) {
      context.setRenderGroup(track % groups + 1);
    }
    for (let voice = 0; voice < VOICES; voice++) {
      const frequency = 55 * 2 ** ((track * VOICES + voice) / 24);
      const node = new AudioWorkletNode(context, 'voice', {
        processorOptions: { frequency, weight },
      });
      node.connect(context.destination);
    }
  }

  const start = performance.now();
  await context.startRendering();
  const seconds = (performance.now() - start) / 1000;
  console.log(`${threads} threads, ${groups} groups: ${seconds.toFixed(3)} s for ${SECONDS} s of audio (${(SECONDS / seconds).toFixed(1)}x real time)`);
}
