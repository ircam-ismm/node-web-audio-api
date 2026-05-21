import { kNapiObj } from './lib/symbols.js';
import { kEnumerableProperty } from './lib/utils.js';
import { AudioNode } from './AudioNode.js';

export class AudioDestinationNode extends AudioNode {
  constructor(context, options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
      || options[kNapiObj].constructor.name !== 'NapiAudioDestinationNode'
    ) {
      throw new TypeError('Illegal constructor');
    }

    super(context, {
      [kNapiObj]: options[kNapiObj],
    });
  }

  get maxChannelCount() {
    if (!(this instanceof AudioDestinationNode)) {
      throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioDestinationNode'`);
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
