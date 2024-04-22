const { isFunction } = require('./utils.js');

module.exports.propagateEvent = function propagateEvent(eventTarget, event) {
  // call attribute first if exists
  if (isFunction(eventTarget[`on${event.type}`])) {
    eventTarget[`on${event.type}`](event);
  }
  // then distach to add event listeners
  eventTarget.dispatchEvent(event);
}
