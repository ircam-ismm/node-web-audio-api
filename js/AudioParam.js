// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

const { throwSanitizedError } = require('./lib/errors.js');

const kNativeAudioParam = Symbol('node-web-audio-api:audio-param');

class AudioParam {
  constructor(nativeAudioParam) {
    this[kNativeAudioParam] = nativeAudioParam;
  }


  get value() {
    return this[kNativeAudioParam].value;
  }

  get automationRate() {
    return this[kNativeAudioParam].automationRate;
  }

  get defaultValue() {
    return this[kNativeAudioParam].defaultValue;
  }

  get minValue() {
    return this[kNativeAudioParam].minValue;
  }

  get maxValue() {
    return this[kNativeAudioParam].maxValue;
  }

    // setters

  set value(value) {
    try {
      this[kNativeAudioParam].value = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  set automationRate(value) {
    try {
      this[kNativeAudioParam].automationRate = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

    // methods
    
  setValueAtTime(...args) {
    try {
      return this[kNativeAudioParam].setValueAtTime(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  linearRampToValueAtTime(...args) {
    try {
      return this[kNativeAudioParam].linearRampToValueAtTime(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  exponentialRampToValueAtTime(...args) {
    try {
      return this[kNativeAudioParam].exponentialRampToValueAtTime(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  setTargetAtTime(...args) {
    try {
      return this[kNativeAudioParam].setTargetAtTime(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  setValueCurveAtTime(...args) {
    try {
      return this[kNativeAudioParam].setValueCurveAtTime(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  cancelScheduledValues(...args) {
    try {
      return this[kNativeAudioParam].cancelScheduledValues(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  cancelAndHoldAtTime(...args) {
    try {
      return this[kNativeAudioParam].cancelAndHoldAtTime(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

}

module.exports.kNativeAudioParam = kNativeAudioParam;
module.exports.AudioParam = AudioParam;


  