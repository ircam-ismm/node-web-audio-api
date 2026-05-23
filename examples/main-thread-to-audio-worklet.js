// -----------------------------------------------------------------------------
// Adapted from padenot's ringbuf.js example
// https://github.com/padenot/ringbuf.js/tree/main/public/example/main-thread-to-audioworklet
// -----------------------------------------------------------------------------
import path from 'node:path';

import { AudioContext, AudioWorkletNode } from '#node-web-audio-api';
import { RingBuffer, AudioWriter, ParameterWriter } from 'ringbuf.js';

const audioContext = new AudioContext();
await audioContext.audioWorklet.addModule(path.join('worklets', 'main-thread-to-audio-worklet', 'processor.js'));

let frequency = 440;
let phase = 0.0;
const sine = new Float32Array(128);

// 50ms of buffer, increase in case of glitches
const sharedArrayBuffer = RingBuffer.getStorageForCapacity(
  audioContext.sampleRate / 20,
  Float32Array,
);
const ringBuffer = new RingBuffer(sharedArrayBuffer, Float32Array);
const audioWriter = new AudioWriter(ringBuffer);

const sharedArrayBuffer2 = RingBuffer.getStorageForCapacity(31, Uint8Array);
const ringBuffer2 = new RingBuffer(sharedArrayBuffer2, Uint8Array);
const paramWriter = new ParameterWriter(ringBuffer2);

const processor = new AudioWorkletNode(audioContext, 'processor', {
  processorOptions: {
    audioQueue: sharedArrayBuffer,
    paramQueue: sharedArrayBuffer2,
  },
});

processor.connect(audioContext.destination);

// change freq and amp every second
setInterval(() => {
  frequency = Math.random() * 900 + 100;

  const gain = Math.random();
  paramWriter.enqueue_change(0, gain);

  console.log(`Frequency: ${frequency}, Gain: ${gain}`);
}, 1000);

setInterval(() => {
  // Synthetize a simple sine wave so it's easy to hear glitches, continuously
  // if there is room in the ring buffer.
  while (audioWriter.available_write() > 128) {
    for (let i = 0; i < 128; i++) {
      sine[i] = Math.sin(phase);
      phase += (2 * Math.PI * frequency) / audioContext.sampleRate;
      if (phase > 2 * Math.PI) {
        phase -= 2 * Math.PI;
      }
    }
    audioWriter.enqueue(sine);
  }
}, 10);
