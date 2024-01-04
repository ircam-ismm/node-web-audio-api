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
  class AudioNode extends superclass {
    constructor(...args) {
      try {
        super(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
    // getters

    get context() {
      return super.context;
    }

    get numberOfInputs() {
      return super.numberOfInputs;
    }

    get numberOfOutputs() {
      return super.numberOfOutputs;
    }

    get channelCount() {
      return super.channelCount;
    }

    get channelCountMode() {
      return super.channelCountMode;
    }

    get channelInterpretation() {
      return super.channelInterpretation;
    }

    // setters

    set channelCount(value) {
      try {
        super.channelCount = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set channelCountMode(value) {
      try {
        super.channelCountMode = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set channelInterpretation(value) {
      try {
        super.channelInterpretation = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    // methods - connect / disconnect
    
    connect(...args) {
      // unwrap raw audio params from facade
      if (args[0] instanceof AudioParam) {
        args[0] = args[0][kNativeAudioParam];
      }

      try {
        return super.connect(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    disconnect(...args) {
      // unwrap raw audio params from facade
      if (args[0] instanceof AudioParam) {
        args[0] = args[0][kNativeAudioParam];
      }

      try {
        return super.disconnect(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return AudioNode;
};

  