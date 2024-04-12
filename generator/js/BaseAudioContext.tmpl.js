const { isFunction, kEnumerableProperty } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');

module.exports = (jsExport, _nativeBinding) => {
  class BaseAudioContext extends EventTarget {
    #listener = null;
    #destination = null;

    constructor(options) {
      // Make constructor "private"
      if (
        (typeof options !== 'object') ||
        !(kNapiObj in options)
      ) {
        throw new TypeError('Illegal constructor');
      }

      super();

      this[kNapiObj] = options[kNapiObj];

      this.#listener = null; // lazily instanciated
      this.#destination = new jsExport.AudioDestinationNode(this, {
        [kNapiObj]: this[kNapiObj].destination,
      });
    }

    get listener() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
      }

      if (this.#listener === null) {
        this.#listener = new jsExport.AudioListener({
          [kNapiObj]: this[kNapiObj].listener,
        });
      }

      return this.#listener;
    }

    get destination() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
      }

      return this.#destination;
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

    get state() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
      }

      return this[kNapiObj].state;
    }

    // renderQuantumSize
    // audioWorklet

    get onstatechange() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
      }

      return this._statechange || null;
    }

    set onstatechange(value) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'BaseAudioContext'");
      }

      if (isFunction(value) || value === null) {
        this._statechange = value;
      }
    }

    // This is not exactly what the spec says, but if we reject the promise
    // when decodeErrorCallback is present the program will crash in an
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
        const nativeAudioBuffer = this[kNapiObj].decodeAudioData(arrayBuffer);
        const audioBuffer = new jsExport.AudioBuffer({ [kNapiObj]: nativeAudioBuffer });

        if (isFunction(decodeSuccessCallback)) {
          decodeSuccessCallback(audioBuffer);
        } else {
          return audioBuffer;
        }
      } catch (err) {
        if (isFunction(decodeErrorCallback)) {
          decodeErrorCallback(err);
        } else {
          throw err;
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

      return new jsExport.AudioBuffer(options);
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

      return new jsExport.PeriodicWave(this, options);
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

      return new jsExport.${d.name(n)}(this, options);
    }
    `}).join('\n')}
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
    listener: kEnumerableProperty,
    destination: kEnumerableProperty,
    sampleRate: kEnumerableProperty,
    currentTime: kEnumerableProperty,
    state: kEnumerableProperty,
    onstatechange: kEnumerableProperty,
    decodeAudioData: kEnumerableProperty,
    createBuffer: kEnumerableProperty,
    createPeriodicWave: kEnumerableProperty,
  });

  return BaseAudioContext;
};
