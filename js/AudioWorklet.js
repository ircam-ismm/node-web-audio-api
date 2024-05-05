const fs = require('node:fs').promises;
const path = require('node:path');
const {
  Worker,
  MessageChannel,
} = require('node:worker_threads');

const {
  kCreateProcessor,
  kPrivateConstructor,
} = require('./lib/symbols.js');

class AudioWorklet {
  #port = null;

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
      });

      console.log('> worker online');
    }


    let buffer;
    try {
      // @todo - allow relative path from caller site, probably required for wpt
      const pathname = path.join(process.cwd(), moduleUrl);
      buffer = await fs.readFile(pathname);
    } catch (err) {
      throw new Error(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`);
    }

    // @todo - wait for feedback from worker with param descriptors to resolve promise
    this.#port.postMessage({
      cmd: 'node-web-audio-api:worklet:add-module',
      code: buffer.toString(),
    });
  }

  [kCreateProcessor](name, processorOptions, id) {
    const { port1, port2 } = new MessageChannel();

    // @todo - check if some processorOptions must be transfered as well
    this.#port.postMessage({
      cmd: 'node-web-audio-api:worklet:create-processor',
      name,
      processorOptions,
      messagePort: port2,
      id,
    }, [port2]);

    return port1;
  }
}

module.exports = AudioWorklet;

