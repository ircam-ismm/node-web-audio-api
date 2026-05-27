import {
  isFunction,
  kEnumerableProperty,
  kHiddenProperty,
} from './lib/utils.js';
import {
  kNapiObj,
  kPrivateConstructor,
} from './lib/symbols.js';

import { AudioWorklet } from './AudioWorklet.js';
import { AudioDestinationNode } from './AudioDestinationNode.js';
import { AudioListener } from './AudioListener.js';
import { AudioBuffer } from './AudioBuffer.js';
import { PeriodicWave } from './PeriodicWave.js';
// import nodes for factory methods
${d.nodes.map(n => {
  let factoryName = d.factoryName(n);
  let factoryIdl = d.factoryIdl(factoryName);
  if (factoryIdl === undefined) { return ``; }

  return `\
import { ${d.name(n)} } from './${d.name(n)}.js';
`
}).join('')}

export class BaseAudioContext extends EventTarget {
  #audioWorklet = null;
  #destination = null;
  #listener = null;
  #statechange = null;

  constructor(options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object') ||
      !(kNapiObj in options)
    ) {
      throw new TypeError('Illegal constructor');
    }


    super();

    Object.defineProperty(this, kNapiObj, {
      value: options[kNapiObj],
      ...kHiddenProperty,
    });

    this.#audioWorklet = new AudioWorklet({
      [kPrivateConstructor]: true,
      workletId: this[kNapiObj].workletId,
      sampleRate: this[kNapiObj].sampleRate,
      renderQuantumSize: this[kNapiObj].renderQuantumSize,
    });

    this.#destination = new AudioDestinationNode(this, {
      [kNapiObj]: this[kNapiObj].destination,
    });
  }

  get audioWorklet() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    return this.#audioWorklet;
  }

  get destination() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    return this.#destination;
  }

  get listener() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    if (this.#listener === null) {
      this.#listener = new AudioListener({
        [kNapiObj]: this[kNapiObj].listener,
      });
    }

    return this.#listener;
  }

  get sampleRate() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    return this[kNapiObj].sampleRate;
  }

  get currentTime() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    return this[kNapiObj].currentTime;
  }

  get renderQuantumSize() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    return this[kNapiObj].renderQuantumSize;
  }

  get state() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    return this[kNapiObj].state;
  }

  // @fixme - napi-rs 3
  get onstatechange() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    return this.#statechange;
  }

  // @fixme - napi-rs 3
  set onstatechange(value) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    if (isFunction(value) || value === null) {
      this.#statechange = value;
    }
  }

  // This is not exactly what the spec says, but if we reject the promise
  // when decodeErrorCallback is present the program can crash in an
  // unexpected manner
  // cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-decodeaudiodata
  async decodeAudioData(arrayBuffer, decodeSuccessCallback = undefined, decodeErrorCallback = undefined) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    if (arguments.length < 1) {
      throw new TypeError(\`Failed to execute 'decodeAudioData' on 'BaseAudioContext': 1 argument required, but only \${arguments.length} present\`);
    }

    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new TypeError('Failed to execute "decodeAudioData": parameter 1 is not of type "ArrayBuffer"');
    }

    try {
      const nativeAudioBuffer = await this[kNapiObj].decodeAudioData(arrayBuffer);
      const audioBuffer = new AudioBuffer({ [kNapiObj]: nativeAudioBuffer });

      if (isFunction(decodeSuccessCallback)) {
        decodeSuccessCallback(audioBuffer);
      } else {
        return audioBuffer;
      }
    } catch (err) {
      const error = new DOMException(\`Failed to execute 'decodeAudioData': \${err.message}\`, 'EncodingError');

      if (isFunction(decodeErrorCallback)) {
        decodeErrorCallback(error);
      } else {
        throw error;
      }
    }
  }

  createBuffer(numberOfChannels, length, sampleRate) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    if (arguments.length < 3) {
      throw new TypeError(\`Failed to execute 'createBuffer' on 'BaseAudioContext': 3 argument required, but only \${arguments.length} present\`);
    }

    const options = {};

    if (numberOfChannels !== undefined) {
      options.numberOfChannels = numberOfChannels;
    }

    if (length !== undefined) {
      options.length = length;
    }

    if (sampleRate !== undefined) {
      options.sampleRate = sampleRate;
    }

    return new AudioBuffer(options);
  }

  createPeriodicWave(real, imag) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    if (arguments.length < 2) {
      throw new TypeError(\`Failed to execute 'createPeriodicWave' on 'BaseAudioContext': 2 argument required, but only \${arguments.length} present\`);
    }

    const options = {};

    if (real !== undefined) {
      options.real = real;
    }

    if (imag !== undefined) {
      options.imag = imag;
    }

    return new PeriodicWave(this, options);
  }

  // --------------------------------------------------------------------
  // Factory Methods (use the patched AudioNodes)
  // --------------------------------------------------------------------
  ${d.nodes.map(n => {
    let factoryName = d.factoryName(n);
    let factoryIdl = d.factoryIdl(factoryName);
    // createMediaStreamSource is online AudioContext only
    if (factoryIdl === undefined) { return ``; }

    let args = factoryIdl.arguments;

    return `\
  ${d.factoryName(n)}(${args.map(arg => arg.optional ? `${arg.name} = ${arg.default.value}` : arg.name).join(', ')}) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
    }

    const options = {${args.map(arg => arg.name).join(', ')}};

    return new ${d.name(n)}(this, options);
  }
    `}).join('\n')
  }
}

Object.defineProperties(BaseAudioContext, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(BaseAudioContext.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'BaseAudioContext',
  },
  ${d.nodes.map(n => {
    let factoryName = d.factoryName(n);
    let factoryIdl = d.factoryIdl(factoryName);

    // createMediaStreamSource is online AudioContext only
    if (factoryIdl === undefined) {
      return ``;
    }
    return `${factoryName}: kEnumerableProperty,`;
  }).join('')}
  audioWorklet: kEnumerableProperty,
  listener: kEnumerableProperty,
  destination: kEnumerableProperty,
  sampleRate: kEnumerableProperty,
  currentTime: kEnumerableProperty,
  renderQuantumSize: kEnumerableProperty,
  state: kEnumerableProperty,
  decodeAudioData: kEnumerableProperty,
  createBuffer: kEnumerableProperty,
  createPeriodicWave: kEnumerableProperty,
  onstatechange: kEnumerableProperty,
});
