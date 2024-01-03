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

const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');


module.exports = (NativeWaveShaperNode) => {

  const EventTarget = EventTargetMixin(NativeWaveShaperNode);
  const AudioNode = AudioNodeMixin(EventTarget);

  class WaveShaperNode extends AudioNode {

    // getters

    get curve() {
      return super.curve;
    }

    get oversample() {
      return super.oversample;
    }

    // setters

    set curve(value) {
      try {
        super.curve = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set oversample(value) {
      try {
        super.oversample = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    // methods
    
  }

  return WaveShaperNode;
}


  