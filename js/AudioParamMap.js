const {
  kPrivateConstructor,
} = require('./lib/symbols.js');
const {
  kEnumerableProperty,
} = require('./lib/utils.js');

class AudioParamMap {
  #parameters = null;

  constructor(options) {
    if (
      (typeof options !== 'object') ||
      options[kPrivateConstructor] !== true
    ) {
      throw new TypeError('Illegal constructor');
    }

    this.#parameters = options.parameters;
  }

  get size() {
    return this.#parameters.size;
  }

  entries() {
    return this.#parameters.entries();
  }

  keys() {
    return this.#parameters.keys();
  }

  values() {
    return this.#parameters.values();
  }

  forEach(func) {
    return this.#parameters.forEach(func);
  }

  get(name) {
    return this.#parameters.get(name);
  }

  has(name) {
    return this.#parameters.has(name);
  }
}

Object.defineProperties(AudioParamMap, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioParamMap.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioParamMap',
  },
  [Symbol.iterator]: {
    value: AudioParamMap.prototype.entries,
    enumerable: false,
    configurable: true,
    writable: true,
  },
  size: {
    __proto__: null,
    enumerable: true,
    configurable: true,
  },
  entries: kEnumerableProperty,
  keys: kEnumerableProperty,
  values: kEnumerableProperty,
  forEach: kEnumerableProperty,
  get: kEnumerableProperty,
  has: kEnumerableProperty,
});

module.exports = AudioParamMap;
