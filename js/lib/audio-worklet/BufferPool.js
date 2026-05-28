import {
  markAsUntransferable,
} from 'node:worker_threads';

export class BufferPool {
  #bufferSize;
  #pool;

  constructor(bufferSize, initialPoolSize) {
    this.#bufferSize = bufferSize;
    this.#pool = new Array(initialPoolSize);

    for (let i = 0; i < this.#pool.length; i++) {
      this.#pool[i] = this.#allocate();
    }
  }

  #allocate() {
    const float32 = new Float32Array(this.#bufferSize);
    markAsUntransferable(float32);
    // Mark underlying buffer as untransferable too, this will fail one of
    // the task in `audioworkletprocessor-process-frozen-array.https.html`
    // but prevent segmentation fault
    markAsUntransferable(float32.buffer);

    return float32;
  }

  get size() {
    return this.#pool.length;
  }

  get() {
    if (this.#pool.length === 0) {
      return this.#allocate();
    }

    return this.#pool.pop();
  }

  recycle(buffer) {
    // make sure we don't pollute the pool
    if (buffer.length !== this.#bufferSize) {
      throw new Error(`Attempt to recycle a buffer of length ${buffer.length} in a pool of buffers of length ${this.#bufferSize}`);
    }

    this.#pool.push(buffer);
  }
}
