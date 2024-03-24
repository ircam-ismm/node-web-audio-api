const { isFunction } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');
const { kNativeAudioBuffer } = require('./AudioBuffer.js');

const EventTarget = require('./EventTarget.mixin.js');

module.exports = (jsExport /*, nativeBinding */) => {
  class BaseAudioContext extends EventTarget {
    constructor(napiObj) {
      super(napiObj);

      this[kNapiObj] = napiObj;

      const destination = new jsExport.AudioDestinationNode(this[kNapiObj].destination);
      Object.defineProperty(this, 'destination', {
        value: destination,
        writable: false,
      });
    }

    get sampleRate() {
      return this[kNapiObj].sampleRate;
    }

    get currentTime() {
      return this[kNapiObj].currentTime;
    }

    get listener() {
      return this[kNapiObj].listener;
    }

    get state() {
      return this[kNapiObj].state;
    }

    // renderQuantumSize
    // audioWorklet

    get onstatechange() {
      return this._statechange || null;
    }

    set onstatechange(value) {
      if (isFunction(value) || value === null) {
        this._statechange = value;
      }
    }

    // This is not exactly what the spec says, but if we reject the promise
    // when decodeErrorCallback is present the program will crash in an
    // unexpected manner
    // cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-decodeaudiodata
    decodeAudioData(audioData, decodeSuccessCallback, decodeErrorCallback) {
      if (!(audioData instanceof ArrayBuffer)) {
        throw new TypeError('Failed to execute "decodeAudioData": parameter 1 is not of type "ArrayBuffer"');
      }

      try {
        const nativeAudioBuffer = this[kNapiObj].decodeAudioData(audioData);
        const audioBuffer = new jsExport.AudioBuffer({ [kNativeAudioBuffer]: nativeAudioBuffer });

        if (isFunction(decodeSuccessCallback)) {
          decodeSuccessCallback(audioBuffer);
        } else {
          return Promise.resolve(audioBuffer);
        }
      } catch (err) {
        if (isFunction(decodeErrorCallback)) {
          decodeErrorCallback(err);
        } else {
          return Promise.reject(err);
        }
      }
    }

    createBuffer(numberOfChannels, length, sampleRate) {
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
  if (factoryIdl === undefined) {
    return ``;
  }

  let args = factoryIdl.arguments;

return `\
    ${d.factoryName(n)}(${args.map(arg => arg.name).join(', ')}) {
${args.length > 0 ? `\
      const options = {};

      ${args.map(arg => {
        return `
      if (${arg.name} !== undefined) {
        options.${arg.name} = ${arg.name};
      }
        `;
      }).join('')};

      return new jsExport.${d.name(n)}(this, options);\
` : `\
      return new jsExport.${d.name(n)}(this);\
`}
    }
`
  }).join('\n')}
  }

  return BaseAudioContext;
};
