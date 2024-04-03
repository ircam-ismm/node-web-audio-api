const { throwSanitizedError } = require('./lib/errors.js');

const { kEnumerableProperty } = require('./lib/utils.js');
const { kNativeAudioParam } = require('./lib/symbols.js');

class AudioParam {
  constructor(nativeAudioParam) {
    if (nativeAudioParam['Symbol.toStringTag'] !== 'AudioParam') {
      throw new TypeError('Illegal constructor');
    }

    this[kNativeAudioParam] = nativeAudioParam;
  }
  // getters
${d.attributes(d.node).map(attr => {
  return `
  get ${d.name(attr)}() {
    return this[kNativeAudioParam].${d.name(attr)};
  }
`}).join('')}
  // setters
${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  return `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
    }

    try {
      this[kNativeAudioParam].${d.name(attr)} = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }
`}).join('')}
  // methods
${d.methods(d.node, false).reduce((acc, method) => {
  // dedup method names
  if (!acc.find(i => d.name(i) === d.name(method))) {
    acc.push(method)
  }
  return acc;
}, []).map(method => {
  const numRequired = d.minRequiredArgs(method);

  return `
  ${d.name(method)}(...args) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
    }

    if (arguments.length < ${numRequired}) {
      throw new TypeError(\`Failed to execute '${d.name(method)}' on '${d.name(d.node)}': ${numRequired} argument required, but only \${arguments.length}\ present\`);
    }

    try {
      return this[kNativeAudioParam].${d.name(method)}(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
`}).join('')}
}

Object.defineProperties(AudioParam, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioParam.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioParam',
  },

  ${d.attributes(d.node).map(attr => {
    return `${d.name(attr)}: kEnumerableProperty,`;
  }).join('')}

  ${d.methods(d.node, false).reduce((acc, method) => {
    // dedup method names
    if (!acc.find(i => d.name(i) === d.name(method))) {
      acc.push(method)
    }
    return acc;
  }, []).map(method => {
    return `${d.name(method)}: kEnumerableProperty,`;
  }).join('')}

});


module.exports = AudioParam;

