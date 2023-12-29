const { isFunction } = require('./utils.js');

const kEventListeners = Symbol('eventListeners');
const kDispatchEvent = Symbol.for('napiDispatchEvent');

module.exports = (superclass, eventTypes) => class extends superclass {
  [kEventListeners] = new Map();

  constructor(...args) {
    super(...args);

    eventTypes.forEach((eventType) => {
      this[`on${eventType}`] = null;
    });

    // we need to bind because calling [kDispatchEvent] loose `this`
    this[kDispatchEvent] = this[kDispatchEvent].bind(this);
  }

  // instance might
  addEventListener(eventType, callback) {
    if (!this[kEventListeners].has(eventType)) {
      this[kEventListeners].set(eventType, new Set());
    }

    const callbacks = this[kEventListeners].get(eventType);
    callbacks.add(callback);
  }

  removeEventListener(eventType, callback) {
    // this is valid event eventType, otherwaise just ignore
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

  // called from rust
  [kDispatchEvent](err, eventType) {
    const event = new Event(eventType);
    // cannot override, this would need to derive EventTarget
    // cf. https://www.nearform.com/blog/node-js-and-the-struggles-of-being-an-eventtarget/
    // event.target = this;
    // event.currentTarget = this;
    // event.srcElement = this;
    this.dispatchEvent(event);
  }
}
