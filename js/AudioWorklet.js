const {
  resolveObjectURL,
} = require('node:buffer');
const {
  existsSync,
} = require('node:fs');
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
  kWorkletRelease,
  kCheckProcessorsCreated,
} = require('./lib/symbols.js');
const {
  kEnumerableProperty,
} = require('./lib/utils.js');

const caller = require('caller');
// cf. https://www.npmjs.com/package/node-fetch#commonjs
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Retrieve code with different module resolution strategies
 * - file - absolute or relative to cwd path
 *
 * - URL - do not support import within module
 * - Blob - do not support import within module
 * - fallback: relative to caller site
 *   + in fs - support import within module
 *   + caller site is url - required for wpt, probably no other use case
 */
const resolveModule = async (moduleUrl) => {
  let code = null;
  let absPathname = null;

  if (existsSync(moduleUrl)) {
    if (path.isAbsolute(moduleUrl)) {
      absPathname = moduleUrl;
    } else { // moduleUrl is relative to process.cwd();
      absPathname = path.join(process.cwd(), moduleUrl);
    }
  } else if (moduleUrl.startsWith('http')) {
    try {
      const res = await fetch(moduleUrl);
      code = await res.text();
    } catch (err) {
      throw new DOMException(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`, 'AbortError');
    }
  } else if (moduleUrl.startsWith('blob:')) {
    try {
      const blob = resolveObjectURL(moduleUrl);
      code = await blob.text();
    } catch (err) {
      throw new DOMException(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`, 'AbortError');
    }
  } else {
    const callerSite = caller(2);

    if (callerSite.startsWith('http')) { // this branch exists for wpt where caller site is an url
      const baseUrl = callerSite.substring(0, callerSite.lastIndexOf('/'));
      const url = baseUrl + '/' + moduleUrl;

      try {
        const res = await fetch(url);
        code = await res.text();
      } catch (err) {
        throw new DOMException(`Failed to execute 'addModule' on 'AudioWorklet': ${err.message}`, 'AbortError');
      }
    } else {
      // filesystem, relative to caller site or in node_modules
      const dirname = callerSite.substring(0, callerSite.lastIndexOf(path.sep));
      const absDirname = dirname.replace('file://', '');
      const pathname = path.join(absDirname, moduleUrl);

      if (existsSync(pathname)) { // relative to caller site
        absPathname = pathname;
      } else {
        try {
          // try resolve according to process.cwd()
          absPathname = require.resolve(moduleUrl, { paths: [process.cwd()] });
        } catch {
          throw new DOMException(`Failed to execute 'addModule' on 'AudioWorklet': Cannot resolve module ${moduleUrl}`, 'AbortError');
        }
      }
    }
  }

  return { absPathname, code };
};

class AudioWorklet {
  #workletId = null;
  #sampleRate = null;
  #port = null;
  #idPromiseMap = new Map();
  #promiseId = 0;
  #workletParamDescriptorsMap = new Map();
  #pendingCreateProcessors = new Set();

  constructor(options) {
    if (
      (typeof options !== 'object') ||
      options[kPrivateConstructor] !== true
    ) {
      throw new TypeError('Illegal constructor');
    }

    this.#workletId = options.workletId;
    this.#sampleRate = options.sampleRate;
  }

  #bindEvents() {
    // @todo
    // - better error handling, stack trace, etc.
    // - handle 'node-web-audio-api:worklet:ctor-error' message
    this.#port.on('message', event => {
      switch (event.cmd) {
        case 'node-web-audio-api:worklet:module-added': {
          const { promiseId } = event;
          const { resolve } = this.#idPromiseMap.get(promiseId);
          this.#idPromiseMap.delete(promiseId);
          resolve();
          break;
        }
        case 'node-web-audio-api:worklet:add-module-failed': {
          const { promiseId, err } = event;
          const { reject } = this.#idPromiseMap.get(promiseId);
          this.#idPromiseMap.delete(promiseId);
          reject(err);
          break;
        }
        case 'node-web-audio-api:worlet:processor-registered': {
          const { name, parameterDescriptors } = event;
          this.#workletParamDescriptorsMap.set(name, parameterDescriptors);
          break;
        }
        case 'node-web-audio-api:worklet:processor-created': {
          const { id } = event;
          this.#pendingCreateProcessors.delete(id);
          break;
        }
      }
    });
  }

  get port() {
    return this.#port;
  }

  async addModule(moduleUrl) {
    // @important - `resolveModule` must be called first because it uses `caller`
    // which will return `null` if this is not in the first line...
    const resolved = await resolveModule(moduleUrl);

    // launch Worker if not exists
    if (!this.#port) {
      await new Promise(resolve => {
        const workletPathname = path.join(__dirname, 'AudioWorkletGlobalScope.js');
        this.#port = new Worker(workletPathname, {
          workerData: {
            workletId: this.#workletId,
            sampleRate: this.#sampleRate,
          },
        });
        this.#port.on('online', resolve);

        this.#bindEvents();
      });
    }

    const promiseId = this.#promiseId++;
    // This promise is resolved when the Worker returns the name and
    // parameterDescriptors from the added module
    await new Promise((resolve, reject) => {
      this.#idPromiseMap.set(promiseId, { resolve, reject });

      this.#port.postMessage({
        cmd: 'node-web-audio-api:worklet:add-module',
        moduleUrl: resolved.absPathname,
        code: resolved.code,
        promiseId,
      });
    });
  }

  // For OfflineAudioContext only, check that all processors have been properly
  // created before actual `startRendering`
  async [kCheckProcessorsCreated]() {
    //  eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      while (this.#pendingCreateProcessors.size !== 0) {
        // we need a microtask to ensure message can be received
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      resolve();
    });
  }

  [kProcessorRegistered](name) {
    return Array.from(this.#workletParamDescriptorsMap.keys()).includes(name);
  }

  [kGetParameterDescriptors](name) {
    return this.#workletParamDescriptorsMap.get(name);
  }

  [kCreateProcessor](name, options, id) {
    this.#pendingCreateProcessors.add(id);

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
        this.#port.postMessage({
          cmd: 'node-web-audio-api:worklet:exit',
        });
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

