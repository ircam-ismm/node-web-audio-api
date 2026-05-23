
// -----------------------------------------------------------------------------
// Adapted from padenot's ringbuf.js example
// https://github.com/padenot/ringbuf.js/tree/main/public/example/audioworklet-to-worker
// -----------------------------------------------------------------------------

import { AudioWriter, RingBuffer, interleave } from 'ringbuf.js';

class RecorderWorklet extends AudioWorkletProcessor {
  constructor(options) {
    super();
    // Staging buffer to interleave the audio data.
    this.interleaved = new Float32Array(128 * 2); // stereo
    const { sharedArrayBuffer } = options.processorOptions;
    this.audioWriter = new AudioWriter(new RingBuffer(sharedArrayBuffer, Float32Array));
  }

  process(inputs, _outputs, _parameters) {
    // interleave and store in the queue
    if (inputs[0]) {
      interleave(inputs[0], this.interleaved);

      if (this.audioWriter.enqueue(this.interleaved) !== 256) {
        console.log(`underrun: the worker doesn't dequeue fast enough!`);
      }
    }
    return true;
  }
}

registerProcessor("recorder-worklet", RecorderWorklet);
