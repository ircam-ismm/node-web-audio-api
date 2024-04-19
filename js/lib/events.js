const { kNapiObj, kDispatchEvent } = require('./symbols.js');
const { isFunction } = require('./utils.js');

/**
 * Listen for events from Rust, and bridge them to Node EventTarget paradigm
 */
module.exports.bridgeEventTarget = function bridgeEventTarget(jsObj, jsExport) {
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
      event.inputBuffer = new jsExport.AudioBuffer({
        [kNapiObj]: eventOrType.inputBuffer,
      });
      event.outputBuffer = new jsExport.AudioBuffer({
        [kNapiObj]: eventOrType.outputBuffer,
      });
    }

    // call attribute first if it exists
    if (isFunction(jsObj[`on${eventType}`])) {
      jsObj[`on${eventType}`](event);
    }

    // then distach to listeners registered though addEventListener
    jsObj.dispatchEvent(event);
  }

  // ask Rust to register `kDispatchEvent` as listener
  jsObj[kNapiObj].__initEventTarget__();
}
