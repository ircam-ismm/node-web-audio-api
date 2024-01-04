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

const { AudioParam } = require('./AudioParam.js');
const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');


module.exports = (NativeAnalyserNode) => {

  const EventTarget = EventTargetMixin(NativeAnalyserNode);
  const AudioNode = AudioNodeMixin(EventTarget);

  class AnalyserNode extends AudioNode {
    constructor(context, options) {
      super(context, options);

    }

    // getters

    get fftSize() {
      return super.fftSize;
    }

    get frequencyBinCount() {
      return super.frequencyBinCount;
    }

    get minDecibels() {
      return super.minDecibels;
    }

    get maxDecibels() {
      return super.maxDecibels;
    }

    get smoothingTimeConstant() {
      return super.smoothingTimeConstant;
    }

    // setters

    set fftSize(value) {
      try {
        super.fftSize = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set minDecibels(value) {
      try {
        super.minDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set maxDecibels(value) {
      try {
        super.maxDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set smoothingTimeConstant(value) {
      try {
        super.smoothingTimeConstant = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    // methods
    
    getFloatFrequencyData(...args) {
      try {
        return super.getFloatFrequencyData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getByteFrequencyData(...args) {
      try {
        return super.getByteFrequencyData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getFloatTimeDomainData(...args) {
      try {
        return super.getFloatTimeDomainData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getByteTimeDomainData(...args) {
      try {
        return super.getByteTimeDomainData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return AnalyserNode;
};


  