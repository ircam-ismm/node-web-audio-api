import conversions from 'webidl-conversions';

import {
  throwSanitizedError,
} from './lib/errors.js';
import {
  propagateEvent,
} from './lib/events.js';
import {
  isFunction,
  kEnumerableProperty,
} from './lib/utils.js';
import {
  kNapiObj,
} from './lib/symbols.js';
import {
  AudioNode,
} from './AudioNode.js';

export class AudioScheduledSourceNode extends AudioNode {
  #onended = null;

  constructor(context, options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
    ) {
      throw new TypeError('Illegal constructor');
    }

    super(context, options);

    // Use WeakRef to make sure the node can be properly garbage collected
    const weakRef = new WeakRef(this);

    this[kNapiObj].onended(function(napiEvent) {
      const node = weakRef.deref();

      if (node) {
        const event = new Event(napiEvent.type);
        propagateEvent(node, event);
      }
    });
  }

  get onended() {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
    }

    return this.#onended;
  }

  set onended(value) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
    }

    if (isFunction(value) || value === null) {
      this.#onended = value;
    }
  }

  start(when = 0) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
    }

    when = conversions['double'](when, {
      context: `Failed to execute 'start' on 'AudioScheduledSourceNode': Parameter 1`,
    });

    try {
      return this[kNapiObj].start(when);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  stop(when = 0) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
    }

    when = conversions['double'](when, {
      context: `Failed to execute 'stop' on 'AudioScheduledSourceNode': Parameter 1`,
    });

    try {
      return this[kNapiObj].stop(when);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
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
  onended: kEnumerableProperty,
  start: kEnumerableProperty,
  stop: kEnumerableProperty,
});
