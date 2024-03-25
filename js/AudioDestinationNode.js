const { kNapiObj } = require('./lib/symbols.js');
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

module.exports = AudioDestinationNode;

