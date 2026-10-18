// Reports an id of the AudioWorkletGlobalScope it runs in, and writes 0.1

// a top-level await keeps the import pending, like a module that loads data first
await new Promise(resolve => setTimeout(resolve, 20));

globalThis.scopeId ??= Math.random();

class ScopeProbe extends AudioWorkletProcessor {
  #reported = false;

  process(inputs, outputs) {
    if (!this.#reported) {
      this.port.postMessage(globalThis.scopeId);
      this.#reported = true;
    }
    outputs[0].forEach(channel => channel.fill(0.1));
    return true;
  }
}

registerProcessor('scope-probe', ScopeProbe);
