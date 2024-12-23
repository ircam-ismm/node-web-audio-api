const conversions = require('webidl-conversions');

const {
  kNapiObj,
  kOnUpdate,
} = require('./lib/symbols.js');
const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  propagateEvent,
} = require('./lib/events.js');
const {
  AudioRenderCapacityEvent,
} = require('./Events.js');

class AudioRenderCapacity extends EventTarget {
  #onupdate = null;

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

    this[kNapiObj][kOnUpdate] = (function(err, rawEvent) {
      const event = new AudioRenderCapacityEvent('update', rawEvent);
      propagateEvent(this, event);
    }).bind(this);

    this[kNapiObj].listen_to_events();
  }

  get onupdate() {
    if (!(this instanceof AudioRenderCapacity)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioRenderCapacity\'');
    }

    return this.#onupdate;
  }

  set onupdate(value) {
    if (!(this instanceof AudioRenderCapacity)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioRenderCapacity\'');
    }

    if (isFunction(value) || value === null) {
      this.#onupdate = value;
    }
  }

  start(options = null) {
    if (!(this instanceof AudioRenderCapacity)) {
      throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioRenderCapacity'`);
    }

    let targetOptions = {};

    if (typeof options === 'object' && options !== null) {
      if (!('updateInterval' in options)) {
        throw new TypeError(`Failed to execute 'start' on 'AudioRenderCapacity': Failed to read the 'updateInterval' property on 'AudioRenderCapacityOptions'`);
      }

      targetOptions.updateInterval = conversions['double'](options.updateInterval, {
        context: `Failed to execute 'start' on 'AudioRenderCapacity': Failed to read the 'updateInterval' property on 'AudioRenderCapacityOptions': The provided value ()`,
      });
    } else {
      targetOptions.updateInterval = 1;
    }

    return this[kNapiObj].start(targetOptions);
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

  onupdate: kEnumerableProperty,
  start: kEnumerableProperty,
  stop: kEnumerableProperty,
});

module.exports = AudioRenderCapacity;


