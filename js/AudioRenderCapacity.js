const { kNapiObj } = require('./lib/symbols.js');
const { kEnumerableProperty } = require('./lib/utils.js');

class AudioRenderCapacity extends EventTarget {
  constructor(options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
      || options[kNapiObj]['Symbol.toStringTag'] !== 'AudioRenderCapacity'
    ) {
      throw new TypeError('Illegal constructor');
    }

    super();

    this[kNapiObj] = options[kNapiObj];
  }

  start() {
    if (!(this instanceof AudioRenderCapacity)) {
      throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioRenderCapacity'`);
    }

    return this[kNapiObj].start();
  }

  stop() {
    if (!(this instanceof AudioRenderCapacity)) {
      throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioRenderCapacity'`);
    }

    return this[kNapiObj].start();
  }
}

Object.defineProperties(AudioRenderCapacity, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioRenderCapacity.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioRenderCapacity',
  },

  start: kEnumerableProperty,
  stop: kEnumerableProperty,
});

module.exports = AudioRenderCapacity;


