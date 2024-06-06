const conversions = require('webidl-conversions');

const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  propagateEvent,
} = require('./lib/events.js');
const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  kNapiObj,
  kOnEnded,
} = require('./lib/symbols.js');

const AudioNode = require('./AudioNode.js');

class AudioScheduledSourceNode extends AudioNode {
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

    // Add function to Napi object to bridge from Rust events to JS EventTarget
    // It will be effectively registered on rust side when `start` is called
    //
    // Note 2024-06-05 - We use bind instead of arrow function because arrow function
    // prevent the node to be collected by Scavenge step of GC, which can lead to
    // oversized graphs and performance issues.
    // cf. https://github.com/ircam-ismm/node-web-audio-api/tree/fix/118
    this[kNapiObj][kOnEnded] = (function(_err, rawEvent) {
      const event = new Event(rawEvent.type);
      propagateEvent(this, event);
    }).bind(this);
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

module.exports = AudioScheduledSourceNode;
