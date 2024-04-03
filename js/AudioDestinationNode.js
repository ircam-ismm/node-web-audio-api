const { kNapiObj } = require('./lib/symbols.js');
const { kEnumerableProperty } = require('./lib/utils.js');
const AudioNode = require('./AudioNode.js');

class AudioDestinationNode extends AudioNode {
  constructor(context, napiObj) {
    // Make constructor "private"
    // @todo - this is not very solid, but does the job for now
    if (napiObj['Symbol.toStringTag'] !== 'AudioDestinationNode') {
      throw new TypeError('Illegal constructor');
    }

    super(context, napiObj);
  }

  get maxChannelCount() {
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

