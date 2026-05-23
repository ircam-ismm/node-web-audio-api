// -----------------------------------------------------------------------------
// Adapted from padenot's ringbuf.js example
// https://github.com/padenot/ringbuf.js/tree/main/public/example/main-thread-to-audioworklet
// -----------------------------------------------------------------------------
import { AudioReader, ParameterReader, RingBuffer } from 'ringbuf.js';

class Processor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  constructor(options) {
    super(options);
    this.interleaved = new Float32Array(128);
    this.amp = 1.0;
    this.o = { index: 0, value: 0 };

    const { audioQueue, paramQueue } = options.processorOptions;

    this.audioReader = new AudioReader(
      new RingBuffer(audioQueue, Float32Array)
    );
    this.paramReader = new ParameterReader(
      new RingBuffer(paramQueue, Uint8Array)
    );
  }

  process(inputs, outputs, parameters) {
    // get any param changes
    if (this.paramReader.dequeue_change(this.o)) {
      this.amp = this.o.value;
    }

    // read 128 frames from the queue, [deinterleave,] and write to output buffers.
    this.audioReader.dequeue(this.interleaved);

    for (let i = 0; i < 128; i++) {
      outputs[0][0][i] = this.amp * this.interleaved[i];
    }

    return true;
  }
}

registerProcessor("processor", Processor);
