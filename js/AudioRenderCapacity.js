import conversions from 'webidl-conversions';

import {
  kNapiObj,
} from './lib/symbols.js';
import {
  isFunction,
  kEnumerableProperty,
} from './lib/utils.js';
import {
  propagateEvent,
} from './lib/events.js';
import {
  AudioRenderCapacityEvent,
} from './Events.js';

export class AudioRenderCapacity extends EventTarget {
  #onupdate = null;

  constructor(options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
      || options[kNapiObj].constructor.name !== 'NapiAudioRenderCapacity'
    ) {
      throw new TypeError('Illegal constructor');
    }

    super();

    this[kNapiObj] = options[kNapiObj];

    this[kNapiObj].onupdate((function(rawEvent) {
      const event = new AudioRenderCapacityEvent('update', rawEvent);
      propagateEvent(this, event);
    }).bind(this));
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

    return this[kNapiObj].stop();
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
