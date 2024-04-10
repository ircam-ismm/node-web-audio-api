const conversions = require("webidl-conversions");
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

${d.methods(d.node, false).map(method => {
  const args = method.arguments;

    return `
  ${d.name(method)}(${args.map(arg => arg.optional ? `${arg.name} = ${arg.default.value}` : arg.name).join(', ')}) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioScheduledSourceNode'");
    }

    ${args.map((arg, index) => {
      const idlType = arg.idlType.idlType;
      return `
    ${arg.name} = conversions['${idlType}'](${arg.name}, {
      context: \`Failed to execute '${d.name(method)}' on 'AudioScheduledSourceNode': Parameter ${index + 1}\`,
    });
      `;
    }).join('')}

    try {
      return this[kNapiObj].${d.name(method)}(${args.map(arg => arg.name).join(', ')});
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

module.exports = AudioScheduledSourceNode;
