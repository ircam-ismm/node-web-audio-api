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
 * - file - absolute or relative to cwd pathname
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
    let callerSite = caller(2);

    if (callerSite.startsWith('http')) {
      // this branch exists for wpt where caller site is an url, moduleUrl can be both relative or absolute
      const baseUrl = moduleUrl.startsWith('/')
        ? new URL(callerSite).origin
        : callerSite.substring(0, callerSite.lastIndexOf('/')) + '/';

      const url = baseUrl + moduleUrl;

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
  #renderQuantumSize = null;
  #worker = null;
  #publicPort = null;
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
    this.#renderQuantumSize = options.renderQuantumSize;
  }

  async #initWorkletGlobalScope() {
    // @todo
    // - better error handling, stack trace, etc.
    // - handle 'node-web-audio-api:worklet:ctor-error' message
    await new Promise(resolve => {
      const workletPathname = path.join(__dirname, 'AudioWorkletGlobalScope.js');

      this.#worker = new Worker(workletPathname, {
        workerData: {
          workletId: this.#workletId,
          sampleRate: this.#sampleRate,
          renderQuantumSize: this.#renderQuantumSize,
        },
      });

      this.#worker.on('online', resolve);

      this.#worker.on('message', event => {
        switch (event.cmd) {
          case 'node-web-audio-api:worklet:enter-ack': {
            const { promiseId } = event;
            const { resolve } = this.#idPromiseMap.get(promiseId);
            this.#idPromiseMap.delete(promiseId);
            resolve();
            break;
          }
          case 'node-web-audio-api:worklet:add-module-success': {
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
          case 'node-web-audio-api:worklet:processor-registered': {
            const { name, parameterDescriptors } = event;
            this.#workletParamDescriptorsMap.set(name, parameterDescriptors);
            break;
          }
          case 'node-web-audio-api:worklet:processor-created':
          case 'node-web-audio-api:worklet:ctor-error': {
            const { id } = event;
            this.#pendingCreateProcessors.delete(id);
            break;
          }
        }
      });
    });

    // AudioWorkletGlobalScope is online, create global public message channel
    const promiseId = this.#promiseId++;
    const { resolve, reject, promise } = Promise.withResolvers();
    this.#idPromiseMap.set(promiseId, { resolve, reject });
    const { port1: publicPort1, port2: publicPort2 } = new MessageChannel();

    this.#publicPort = publicPort1;

    this.#worker.postMessage({
      cmd: 'node-web-audio-api:worklet:enter',
      port: publicPort2,
      promiseId,
    }, [publicPort2]);

    await promise;
  }

  get port() {
    return this.#publicPort;
  }

  async addModule(moduleUrl) {
    // @note - `resolveModule` must be called first because it uses `caller`
    // which will return `null` if this is not in the first line
    const resolved = await resolveModule(moduleUrl);

    // launch WorkletGlobalScope if not exists
    if (!this.#worker) {
      await this.#initWorkletGlobalScope();
    }

    const promiseId = this.#promiseId++;
    // The promise is resolved when the Worker returns the name and
    // parameterDescriptors from the added module
    await new Promise((resolve, reject) => {
      this.#idPromiseMap.set(promiseId, { resolve, reject });

      this.#worker.postMessage({
        cmd: 'node-web-audio-api:worklet:add-module',
        moduleUrl: resolved.absPathname,
        code: resolved.code,
        promiseId,
      });
    });
  }

  // For OfflineAudioContext only, check that all processors have been properly
  // created before rendering
  async [kCheckProcessorsCreated]() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      while (this.#pendingCreateProcessors.size !== 0) {
        // we need a macro-task to ensure message can be received
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

    const { port1: messagePort1, port2: messagePort2 } = new MessageChannel();
    const { port1: errorPort1, port2: errorPort2 } = new MessageChannel();
    // @todo - check if we should transfer some processorOptions as well
    this.#worker.postMessage({
      cmd: 'node-web-audio-api:worklet:create-processor',
      name,
      id,
      options,
      messagePort: messagePort2,
      errorPort: errorPort2,
    }, [messagePort2, errorPort2]);

    return {
      messagePort: messagePort1,
      errorPort: errorPort1,
    };
  }

  async [kWorkletRelease]() {
    if (this.#worker) {
      await new Promise(resolve => {
        this.#worker.on('exit', resolve);
        this.#worker.postMessage({
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

