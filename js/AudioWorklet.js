const {
  resolveObjectURL
} = require('node:buffer');
const fs = require('node:fs').promises;
const { existsSync } = require('node:fs');
const path = require('node:path');
const {
  Worker,
  MessageChannel,
} = require('node:worker_threads');

const fetch = require('node-fetch');

const {
  kProcessorRegistered,
  kGetParameterDescriptors,
  kCreateProcessor,
  kPrivateConstructor,
  kWorkletRelease,
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

  #bindEvents() {
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
  }

  get port() {
    return this.#port;
  }

  async addModule(moduleUrl) {
    // try different module resolution strategies
    // 1. in fs, relative to cwd
    // 2. in fs, relative to call site
    // 3. from network (important for wpt)
    // 3. blob (important for wpt too)
    //
    // @important - this must be done first or the Error stack changes
    let code;

    if (existsSync(moduleUrl)) {
      const pathname = moduleUrl;

      try {
        const buffer = await fs.readFile(pathname);
        code = buffer.toString();
      } catch (err) {
        throw new Error(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`);
      }
    } else if (moduleUrl.startsWith('blob:')) {
      try {
        const blob = resolveObjectURL(moduleUrl);
        code = await blob.text();
      } catch (err) {
        throw new Error(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`);
      }
    } else {
      // get caller site from error stack trace
      const callerSite = (new Error()).stack.split('\n')[2].trim().split(' ')[1];

      if (callerSite.startsWith('http')) {
        // we know separators are '/'
        const baseUrl = callerSite.substr(0, callerSite.lastIndexOf('/'));
        let url;

        if (moduleUrl.startsWith('/')) {
          // absolute url
          const origin = new URL(baseUrl).origin;
          url = origin + moduleUrl;
        } else {
          url = baseUrl + '/' + moduleUrl;
        }

        try {
          const res = await fetch(url);
          code = await res.text();
        } catch (err) {
          throw new Error(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`);
        }
      } else {
        const dirname = callerSite.substr(0, callerSite.lastIndexOf(path.sep));
        const absDirname = dirname.replace('file://', '');
        const pathname = path.join(absDirname, moduleUrl);

        if (existsSync(pathname)) {
          try {
            // @todo - allow relative path from caller site, probably required for wpt
            const buffer = await fs.readFile(pathname);
            code = buffer.toString();
          } catch (err) {
            throw new Error(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`);
          }
        } else {
          throw new Error(`Failed to execute 'addModule' on 'AudioWorklet': Cannot resolve module ${moduleUrl}`);
        }
      }
    }

    // launch Worker if not exists
    if (!this.#port) {
      await new Promise(resolve => {
        const workletPathname = path.join(__dirname, 'AudioWorkletGlobalScope.js');
        this.#port = new Worker(workletPathname);
        this.#port.on('online', resolve);

        this.#bindEvents();
      });
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
        code,
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

  [kCreateProcessor](name, options, id) {
    const { port1, port2 } = new MessageChannel();
    // @todo - check if some processorOptions must be transfered as well
    this.#port.postMessage({
      cmd: 'node-web-audio-api:worklet:create-processor',
      name,
      id,
      options,
      port: port2,
    }, [port2]);

    return port1;
  }

  async [kWorkletRelease]() {
    if (this.#port) {
      await new Promise(resolve => {
        this.#port.on('exit', resolve);
        this.#port.terminate();
      });
    }
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

