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

// eslint-disable-next-line no-unused-vars
const { throwSanitizedError } = require('./lib/errors.js');
// eslint-disable-next-line no-unused-vars
const { AudioParam } = require('./AudioParam.js');
const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');


const { kNativeAudioBuffer, kAudioBuffer } = require('./AudioBuffer.js');

module.exports = (NativeBiquadFilterNode) => {
  const EventTarget = EventTargetMixin(NativeBiquadFilterNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class BiquadFilterNode extends AudioNode {
    constructor(context, options) {
      // keep a handle to the original object, if we need to manipulate the
      // options before passing them to NAPI
      const originalOptions = Object.assign({}, options);

      
      if (options !== undefined) {
        if (typeof options !== 'object') {
          throw new TypeError("Failed to construct 'BiquadFilterNode': argument 2 is not of type 'BiquadFilterOptions'")
        }
        
      }
        

      super(context, options);

      

      

      
      this.frequency = new AudioParam(this.frequency);
      this.detune = new AudioParam(this.detune);
      this.Q = new AudioParam(this.Q);
      this.gain = new AudioParam(this.gain);
    }

    // getters

    get type() {
      return super.type;
    }
      
    // setters

    set type(value) {
      try {
        super.type = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
      

    // methods

    getFrequencyResponse(...args) {
      try {
        return super.getFrequencyResponse(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return BiquadFilterNode;
};


  