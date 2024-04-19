const { kNapiObj, kDispatchEvent } = require('./symbols.js');
const { isFunction } = require('./utils.js');

/**
 * Listen for events from Rust, and bridge them to Node EventTarget paradigm
 */
module.exports.bridgeEventTarget = function bridgeEventTarget(jsObj) {
    // Finalize event registration on Rust side
  jsObj[kNapiObj][kDispatchEvent] = (err, eventType) => {
    const event = new Event(eventType);
    // call attribute first if exists
    if (isFunction(jsObj[`on${event.type}`])) {
      jsObj[`on${event.type}`](event);
    }
    // then distach to add event listeners
    jsObj.dispatchEvent(event);
  }
  // ask Rust to register `kDispatchEvent` as listener
  jsObj[kNapiObj].__initEventTarget__();
}

module.exports.propagateEvent = function propagateEvent(eventTarget, event) {
  // call attribute first if exists
  if (isFunction(eventTarget[`on${event.type}`])) {
    eventTarget[`on${event.type}`](event);
  }
  // then distach to add event listeners
  eventTarget.dispatchEvent(event);
}
