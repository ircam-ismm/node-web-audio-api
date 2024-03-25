const { isFunction } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');

const kEventListeners = Symbol('node-web-audio-api:event-listeners');
const kDispatchEvent = Symbol.for('node-web-audio-api:napi-dispatch-event');

class EventTarget {
  [kEventListeners] = new Map();

  constructor(napiObj) {
    // Binding is required because calling [kDispatchEvent] from Rust loose context
    napiObj[kDispatchEvent] = this[kDispatchEvent].bind(this);
  }

  addEventListener(eventType, callback) {
    if (!this[kEventListeners].has(eventType)) {
      this[kEventListeners].set(eventType, new Set());
    }

    const callbacks = this[kEventListeners].get(eventType);
    callbacks.add(callback);
  }

  removeEventListener(eventType, callback) {
    if (this[kEventListeners].has(eventType)) {
      const callbacks = this[kEventListeners].get(eventType);
      callbacks.delete(callback);
    }
  }

  dispatchEvent(event) {
    if (isFunction(this[`on${event.type}`])) {
      this[`on${event.type}`](event);
    }

    if (this[kEventListeners].has(event.type)) {
      const callbacks = this[kEventListeners].get(event.type);
      callbacks.forEach(callback => callback(event));
    }
  }

  // This method is the one that is called from Rust
  [kDispatchEvent](err, eventType) {
    const event = new Event(eventType);
    // cannot override, this would need to derive EventTarget
    // cf. https://www.nearform.com/blog/node-js-and-the-struggles-of-being-an-eventtarget/
    // event.target = this;
    // event.currentTarget = this;
    // event.srcElement = this;

    this.dispatchEvent(event);
  }
};

module.exports = EventTarget;
