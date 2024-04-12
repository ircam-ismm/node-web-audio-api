const { kNapiObj } = require('./lib/symbols.js');
const { kEnumerableProperty } = require('./lib/utils.js');
const AudioNode = require('./AudioNode.js');

class AudioDestinationNode extends AudioNode {
  constructor(context, options) {
    // Make constructor "private"
    // @todo - this is not very solid, but does the job for now
    if (!(kNapiObj in options) || options[kNapiObj]['Symbol.toStringTag'] !== 'AudioDestinationNode') {
      throw new TypeError('Illegal constructor');
    }

    super(context, options[kNapiObj]);
  }

  get maxChannelCount() {
    if (!(this instanceof AudioDestinationNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioDestinationNode'");
    }

    return this[kNapiObj].maxChannelCount;
  }
}

Object.defineProperties(AudioDestinationNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioDestinationNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioDestinationNode',
  },

  maxChannelCount: kEnumerableProperty,
});

module.exports = AudioDestinationNode;

