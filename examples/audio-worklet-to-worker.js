// -----------------------------------------------------------------------------
// Adapted from padenot's ringbuf.js example
// https://github.com/padenot/ringbuf.js/tree/main/public/example/audioworklet-to-worker
// -----------------------------------------------------------------------------
import path from 'node:path';
import fs from 'node:fs';
import { Worker } from 'node:worker_threads';

import { AudioContext, OscillatorNode, GainNode, StereoPannerNode, AudioWorkletNode } from '#node-web-audio-api';
import { RingBuffer } from 'ringbuf.js';
import { sleep } from '@ircam/sc-utils';

const audioContext = new AudioContext();
await audioContext.audioWorklet.addModule(path.join('worklets', 'audio-worklet-to-worker', 'recorder-worklet.js'));
// One second of stereo Float32 PCM ought to be plentiful.
const sharedArrayBuffer = RingBuffer.getStorageForCapacity(audioContext.sampleRate * 2, Float32Array);

// Setup the wav writer worker
const recorderWorker = new Worker('./examples/worklets/audio-worklet-to-worker/wav-writer.js', {
  workerData:  {
    sharedArrayBuffer,
    channelCount: 2,
    sampleRate: audioContext.sampleRate,
  },
});

// Setup web audio
audioContext.resume();

// Generate a tone that goes left and right and up and down. Route it to an
// AudioWorkletProcessor that does the recording, as well as to the output.
const osc = new OscillatorNode(audioContext);
const fm = new OscillatorNode(audioContext, { frequency: 1.0 });
const gain = new GainNode(audioContext, { gain: 110 });
const panner = new StereoPannerNode(audioContext);
const panModulation = new OscillatorNode(audioContext, { frequency: 2.0 });
const recorderWorklet = new AudioWorkletNode(audioContext, 'recorder-worklet', {
  processorOptions: { sharedArrayBuffer },
});

// setup graph
panModulation.connect(panner.pan);
fm.connect(gain).connect(osc.frequency);
osc.connect(panner).connect(audioContext.destination);
panner.connect(recorderWorklet);

osc.start(0);
fm.start(0);
panModulation.start(0);

// Starve the main thread
const mainThreadLoadIntervalId = setInterval(function() {
  var start = Date.now();
  while (Date.now() - start < 90) {}
}, 100);

await sleep(2);

recorderWorker.on('message', async arrayBuffer => {
  console.log('> main thread: stop rendering');

  clearInterval(mainThreadLoadIntervalId);
  await audioContext.close();
  recorderWorker.terminate();

  // Replay the wav file in audio buffer source node
  const pathname = path.join(import.meta.dirname, 'audio-worklet-to-worker.wav');
  console.log('> main thread: write file to disk: ', pathname);

  fs.writeFileSync(pathname, Buffer.from(arrayBuffer));
});

recorderWorker.postMessage({ command: 'stop' });
