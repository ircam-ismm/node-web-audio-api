const fs = require('node:fs').promises;
const path = require('node:path');
const {
  Worker,
  MessageChannel,
} = require('node:worker_threads');

const {
  kProcessorRegistered,
  kGetParameterDescriptors,
  kCreateProcessor,
  kPrivateConstructor,
} = require('./lib/symbols.js');
const {
  kEnumerableProperty,
} = require('./lib/utils.js');

class AudioWorklet {
  #port = null;
  #idPromiseMap = new Map();
  #promiseId = 0;
  #workletParamDescriptorsMap = new Map();

  constructor(options) {
    if (
      (typeof options !== 'object') ||
      options[kPrivateConstructor] !== true
    ) {
      throw new TypeError('Illegal constructor');
    }
  }

  get port() {
    return this.#port;
  }

  async addModule(moduleUrl) {
    if (!this.#port) {
      await new Promise(resolve => {
        const workletPathname = path.join(__dirname, 'AudioWorkletGlobalScope.js');
        this.#port = new Worker(workletPathname);
        this.#port.on('online', resolve);

        this.#port.on('message', event => {
          switch (event.cmd) {
            case 'node-web-audio-api:worklet:processor-registered': {
              const { promiseId, name, parameterDescriptors } = event;
              const { resolve } = this.#idPromiseMap.get(promiseId);

              this.#idPromiseMap.delete(promiseId);
              resolve({ name, parameterDescriptors });
              break;
            }
          }
        });
      });
    }

    let buffer;

    try {
      // @todo - allow relative path from caller site, probably required for wpt
      const pathname = path.join(process.cwd(), moduleUrl);
      buffer = await fs.readFile(pathname);
    } catch (err) {
      throw new Error(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`);
    }

    const promiseId = this.#promiseId++;
    // This promise is resolved when the Worker returns the name and
    // parameterDescriptors from the added module
    const { name, parameterDescriptors } = await new Promise((resolve, reject) => {
      this.#idPromiseMap.set(promiseId, { resolve, reject });

      // @todo - handle errors
      // - no `process` found in class
      // - invalid parameterDescriptors
      this.#port.postMessage({
        cmd: 'node-web-audio-api:worklet:add-module',
        code: buffer.toString(),
        promiseId,
      });
    });

    this.#workletParamDescriptorsMap.set(name, parameterDescriptors);
  }

  [kProcessorRegistered](name) {
    return Array.from(this.#workletParamDescriptorsMap.keys()).includes(name);
  }

  [kGetParameterDescriptors](name) {
    return this.#workletParamDescriptorsMap.get(name);
  }

  [kCreateProcessor](name, processorOptions, id) {
    const { port1, port2 } = new MessageChannel();

    // @todo - check if some processorOptions must be transfered as well
    this.#port.postMessage({
      cmd: 'node-web-audio-api:worklet:create-processor',
      name,
      id,
      processorOptions,
      messagePort: port2,
    }, [port2]);

    return port1;
  }
}

Object.defineProperties(AudioWorklet, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioWorklet.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioWorklet',
  },
  addModule: kEnumerableProperty,
  port: kEnumerableProperty,
});

module.exports = AudioWorklet;

