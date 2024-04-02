const { throwSanitizedError } = require('./lib/errors.js');
const { kNapiObj } = require('./lib/symbols.js');
const { kEnumerableProperty } = require('./lib/utils.js');

const { AudioParam, kNativeAudioParam } = require('./AudioParam.js');

class AudioNode extends EventTarget {
  #context = null;

  constructor(context, napiObj) {
    super(napiObj);

    this.#context = context;
    this[kNapiObj] = napiObj;
  }

  get context() {
    return this.#context;
  }

${d.attributes(d.node).filter(attr => d.name(attr) !== 'context').map(attr => {
return `
  get ${d.name(attr)}() {
    return this[kNapiObj].${d.name(attr)};
  }
`}).join('')}

${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
return `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
    }

    try {
      this[kNapiObj].${d.name(attr)} = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }
`}).join('')}

  // ------------------------------------------------------
  // connect / disconnect
  // ------------------------------------------------------

  // @todo
  // AudioNode connect (AudioNode destinationNode,
  //                    optional unsigned long output = 0,
  //                    optional unsigned long input = 0);
  // undefined connect (AudioParam destinationParam, optional unsigned long output = 0);

  connect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
    }

    const jsDest = args[0];

    // note that audio listener params are not wrapped
    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    if (args[0] instanceof AudioNode) {
      args[0] = args[0][kNapiObj];
    }

    try {
      this[kNapiObj].connect(...args);
      return jsDest;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  // @todo
  // undefined disconnect ();
  // undefined disconnect (unsigned long output);
  // undefined disconnect (AudioNode destinationNode);
  // undefined disconnect (AudioNode destinationNode, unsigned long output);
  // undefined disconnect (AudioNode destinationNode,
  //                       unsigned long output,
  //                       unsigned long input);
  // undefined disconnect (AudioParam destinationParam);
  // undefined disconnect (AudioParam destinationParam, unsigned long output);

  disconnect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
    }

    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    if (args[0] instanceof AudioNode) {
      args[0] = args[0][kNapiObj];
    }

    try {
      this[kNapiObj].disconnect(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
}

Object.defineProperties(AudioNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioNode',
  },

  ${d.attributes(d.node).map(attr => {
    return `${d.name(attr)}: kEnumerableProperty,`;
  }).join('')}

  connect: kEnumerableProperty,
  disconnect: kEnumerableProperty,
});

module.exports = AudioNode;
