import {
  resolveObjectURL,
} from 'node:buffer';
import {
  existsSync,
} from 'node:fs';
import path from 'node:path';
import {
  Worker,
  MessageChannel,
} from 'node:worker_threads';
// import {
//   createRequire
// } from 'node:module';

import caller from 'caller';

import {
  kProcessorRegistered,
  kGetParameterDescriptors,
  kCreateProcessor,
  kCreateNativePort,
  kPrivateConstructor,
  kWorkletRelease,
  kCheckProcessorsCreated,
} from './lib/symbols.js';
import {
  kEnumerableProperty,
} from './lib/utils.js';

// napi's serde reads a typed array as its bytes, but only from a Uint8Array
function asBytes(value) {
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (Array.isArray(value)) {
    return value.map(asBytes);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, asBytes(item)]));
  }
  return value;
}

// A processor's { Float32Array: bytes } arrives as a Float32Array of its bytes
function fromBytes(value) {
  if (Array.isArray(value)) {
    return value.map(fromBytes);
  }
  if (value !== null && typeof value === 'object' && !ArrayBuffer.isView(value)) {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === 'Float32Array' && ArrayBuffer.isView(value.Float32Array)) {
      const bytes = value.Float32Array;
      return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fromBytes(item)]));
  }
  return value;
}

// const require = createRequire(import.meta.url);

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
          // try resolve according to process.cwd() including node_modules
          absPathname = import.meta.resolve(moduleUrl, { paths: [process.cwd()] });
        } catch {
          throw new DOMException(`Failed to execute 'addModule' on 'AudioWorklet': Cannot resolve module ${moduleUrl}`, 'AbortError');
        }
      }
    }
  }

  return { absPathname, code };
};

export class AudioWorklet {
  #workletId = null;
  #sampleRate = null;
  #renderQuantumSize = null;
  // workletId -> AudioWorkletGlobalScope, one per render group: { worker, port }
  #scopes = new Map();
  // modules added so far, loaded into the scopes started later
  #modules = [];
  #idPromiseMap = new Map();
  #promiseId = 0;
  #workletParamDescriptorsMap = new Map();
  #pendingCreateProcessors = new Set();
  #nativePorts = new Set();


  constructor(options) {
    if (
      (typeof options !== 'object') ||
      options[kPrivateConstructor] !== true
    ) {
      throw new TypeError('Illegal constructor');
    }

    // channel of render group 0, the other groups get theirs from their first AudioWorkletNode
    this.#workletId = options.workletId;
    this.#sampleRate = options.sampleRate;
    this.#renderQuantumSize = options.renderQuantumSize;
  }

  // Post a command whose reply carries `promiseId`, and return the reply promise
  #request(worker, message, transfer = []) {
    const promiseId = this.#promiseId++;
    const { resolve, reject, promise } = Promise.withResolvers();
    this.#idPromiseMap.set(promiseId, { resolve, reject });
    worker.postMessage({ ...message, promiseId }, transfer);
    return promise;
  }

  #onMessage(event) {
    switch (event.cmd) {
      case 'node-web-audio-api:worklet:enter-ack':
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
        // every scope registers the same modules, so the same names and descriptors
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
  }

  // Start the AudioWorkletGlobalScope of a render group. Commands can be posted right away, the
  // Worker handles them in order once it runs.
  // @todo - better error handling, stack trace, etc.
  #startScope(workletId) {
    const workletPathname = path.join(import.meta.dirname, 'AudioWorkletGlobalScope.js');
    const worker = new Worker(workletPathname, {
      workerData: {
        workletId,
        sampleRate: this.#sampleRate,
        renderQuantumSize: this.#renderQuantumSize,
      },
    });
    worker.on('message', event => this.#onMessage(event));

    // global public message channel of the scope
    const { port1, port2 } = new MessageChannel();
    this.#request(worker, { cmd: 'node-web-audio-api:worklet:enter', port: port2 }, [port2]);

    const scope = { worker, port: port1 };
    this.#scopes.set(workletId, scope);
    return scope;
  }

  #loadModule(scope, module) {
    return this.#request(scope.worker, {
      cmd: 'node-web-audio-api:worklet:add-module',
      moduleUrl: module.absPathname,
      code: module.code,
    });
  }

  // ponytail: one AudioWorkletGlobalScope per render group instead of one per context, this
  // port reaches the scope of group 0 only. Processors that share module-level state across
  // nodes no longer share it with the nodes of other groups.
  get port() {
    return this.#scopes.get(this.#workletId)?.port ?? null;
  }

  async addModule(moduleUrl) {
    // @note - `resolveModule` must be called first because it uses `caller`
    // which will return `null` if this is not in the first line
    const resolved = await resolveModule(moduleUrl);

    // launch WorkletGlobalScope if not exists
    if (!this.#scopes.has(this.#workletId)) {
      this.#startScope(this.#workletId);
    }

    // recorded first, so that a scope started meanwhile loads it too
    this.#modules.push(resolved);

    // The promise is resolved when every scope returned the name and
    // parameterDescriptors from the added module
    try {
      await Promise.all(Array.from(this.#scopes.values(), scope => this.#loadModule(scope, resolved)));
    } catch (err) {
      this.#modules.splice(this.#modules.indexOf(resolved), 1);
      throw err;
    }
  }

  // For OfflineAudioContext only, check that all processors have been properly
  // created before rendering
  async [kCheckProcessorsCreated]() {
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

  [kCreateProcessor](name, options, id, workletId = this.#workletId) {
    this.#pendingCreateProcessors.add(id);

    let scope = this.#scopes.get(workletId);

    // first AudioWorkletNode of its render group, start the group's scope with every module
    // added so far, the scope creates the processor once they are loaded
    if (!scope) {
      scope = this.#startScope(workletId);
      for (const module of this.#modules) {
        this.#loadModule(scope, module).catch(err => console.log(err));
      }
    }

    const { port1: messagePort1, port2: messagePort2 } = new MessageChannel();
    const { port1: errorPort1, port2: errorPort2 } = new MessageChannel();
    // @todo - check if we should transfer some processorOptions as well
    scope.worker.postMessage({
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

  // The port of a node running a processor written in Rust: no Worker, the far
  // end forwards to and from the processor, until the context closes
  [kCreateNativePort](napiObj) {
    const { port1, port2 } = new MessageChannel();

    port2.on('message', message => {
      try {
        napiObj.postMessage(asBytes(message));
      } catch (err) {
        console.log(err);
      }
    });
    port2.unref();
    napiObj.onmessage(message => port2.postMessage(fromBytes(message)));
    this.#nativePorts.add(port2);

    return port1;
  }

  async [kWorkletRelease]() {
    for (const port of this.#nativePorts) {
      port.close();
    }
    this.#nativePorts.clear();

    await Promise.all(Array.from(this.#scopes.values(), ({ worker }) => new Promise(resolve => {
      worker.on('exit', resolve);
      worker.postMessage({
        cmd: 'node-web-audio-api:worklet:exit',
      });
    })));
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
