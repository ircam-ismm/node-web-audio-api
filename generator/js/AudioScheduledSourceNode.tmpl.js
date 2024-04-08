const { throwSanitizedError } = require('./lib/errors.js');
const { isFunction, kEnumerableProperty } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');

const AudioNode = require('./AudioNode.js');

class AudioScheduledSourceNode extends AudioNode {
  constructor(context, napiObj) {
    super(context, napiObj);
  }
${d.attributes(d.node).map(attr => {
  // onended events
  return `
  get ${d.name(attr)}() {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioScheduledSourceNode'");
    }

    return this._${d.name(attr)} || null;
  }
  `}).join('')}

${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  // onended events
  return `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioScheduledSourceNode'");
    }

    if (isFunction(value) || value === null) {
      this._${d.name(attr)} = value;
    }
  }
  `}).join('')}

${d.methods(d.node, false).reduce((acc, method) => {
    // dedup method names
    if (!acc.find(i => d.name(i) === d.name(method))) {
      acc.push(method)
    }
    return acc;
  }, []).map(method => {
    return `
  ${d.name(method)}(...args) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioScheduledSourceNode'");
    }

    try {
      return this[kNapiObj].${d.name(method)}(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
  `}).join('')}
}

Object.defineProperties(AudioScheduledSourceNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioScheduledSourceNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioScheduledSourceNode',
  },

  ${d.attributes(d.node).map(attr => {
    return `${d.name(attr)}: kEnumerableProperty,`;
  }).join('')}

  start: kEnumerableProperty,
  stop: kEnumerableProperty,
});

Object.defineProperties(AudioScheduledSourceNode.prototype.start, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioScheduledSourceNode.prototype.stop, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

module.exports = AudioScheduledSourceNode;
