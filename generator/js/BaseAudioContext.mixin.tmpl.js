const { AudioDestinationNode } = require('./AudioDestinationNode.js');
const { isFunction } = require('./lib/utils.js');

module.exports = (superclass, bindings) => {
  const {
${d.nodes.map(n => `    ${d.name(n)},`).join('\n')}
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
        const audioBuffer = super.decodeAudioData(audioData);

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

    // --------------------------------------------------------------------
    // Factory Methods (use the patched AudioNodes)
    // --------------------------------------------------------------------
${d.nodes.map(n => {
  let factoryName = d.factoryName(n);
  let factoryIdl = d.factoryIdl(factoryName);
  let args = factoryIdl.arguments;

return `\
    ${d.factoryName(n)}(${args.map(arg => arg.name).join(', ')}) {
${args.length > 0 ? `\
      const options = { ${args.map(arg => arg.name).join(', ')} };
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
