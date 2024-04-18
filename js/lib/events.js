const { kNapiObj, kDispatchEvent } = require('./symbols.js');
const { isFunction } = require('./utils.js');

/**
 * Listen for events from Rust, and bridge them to Node EventTarget paradigm
 */
module.exports.bridgeEventTarget = function bridgeEventTarget(jsObj, payload) {
    // Finalize event registration on Rust side
  jsObj[kNapiObj][kDispatchEvent] = (err, eventOrType) => {
    if (err) {
      console.log(err);
      return;
    }

    const eventType = eventOrType.type ? eventOrType.type : eventOrType;
    const event = new Event(eventType);

    if (eventType === 'audioprocess') {
      event.playbackTime = eventOrType.playbackTime;
      event.inputBuffer = new payload.AudioBuffer(eventOrType.inputBuffer);
      event.outputBuffer = new payload.AudioBuffer(eventOrType.outputBuffer);
    }
    // call attribute first if exists
    if (isFunction(jsObj[`on${eventType}`])) {
      jsObj[`on${eventType}`](event);
    }

    // then distach to add event listeners
    jsObj.dispatchEvent(event);
  }
  // ask Rust to register `kDispatchEvent` as listener
  jsObj[kNapiObj].__initEventTarget__();
}
