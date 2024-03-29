const { AudioDestinationNode } = require('./AudioDestinationNode.js');
const { isFunction } = require('./lib/utils.js');
const { kNativeAudioBuffer } = require('./AudioBuffer.js');

module.exports = (superclass, bindings) => {
  const {
    /* eslint-disable no-unused-vars */
${d.nodes.map(n => `    ${d.name(n)},`).join('\n')}
    /* eslint-enable no-unused-vars */
    AudioBuffer,
    PeriodicWave,
  } = bindings;

  class BaseAudioContext extends superclass {
    constructor(...args) {
      super(...args);

      this.destination = new AudioDestinationNode(this.destination);
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
        const nativeAudioBuffer = super.decodeAudioData(audioData);
        const audioBuffer = new AudioBuffer({ [kNativeAudioBuffer]: nativeAudioBuffer });

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

      return new AudioBuffer(options);
    }

    createPeriodicWave(real, imag) {
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

      return new ${d.name(n)}(this, options);\
` : `\
      return new ${d.name(n)}(this);\
`}
    }
`
  }).join('\n')}
  }

  return BaseAudioContext;
};
