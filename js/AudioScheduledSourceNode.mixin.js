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

const { AudioParam, kNativeAudioParam } = require('./AudioParam.js');

module.exports = (superclass) => {
  class AudioScheduledSourceNode extends superclass {
    constructor(...args) {
      try {
        super(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
    // getters

    get onended() {
      return super.onended;
    }

    // setters

    set onended(value) {
      try {
        super.onended = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    // methods - connect / disconnect
    
    start(...args) {
      // unwrap raw audio params from facade
      if (args[0] instanceof AudioParam) {
        args[0] = args[0][kNativeAudioParam];
      }

      try {
        return super.start(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    stop(...args) {
      // unwrap raw audio params from facade
      if (args[0] instanceof AudioParam) {
        args[0] = args[0][kNativeAudioParam];
      }

      try {
        return super.stop(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return AudioScheduledSourceNode;
};

  