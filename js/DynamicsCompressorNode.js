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

module.exports = (NativeDynamicsCompressorNode) => {
  const EventTarget = EventTargetMixin(NativeDynamicsCompressorNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class DynamicsCompressorNode extends AudioNode {
    constructor(context, options) {
      // keep a handle to the original object, if we need to manipulate the
      // options before passing them to NAPI
      const originalOptions = Object.assign({}, options);

      
      if (options !== undefined) {
        if (typeof options !== 'object') {
          throw new TypeError("Failed to construct 'DynamicsCompressorNode': argument 2 is not of type 'DynamicsCompressorOptions'")
        }
        
      }
        

      super(context, options);

      

      

      
      this.threshold = new AudioParam(this.threshold);
      this.knee = new AudioParam(this.knee);
      this.ratio = new AudioParam(this.ratio);
      this.attack = new AudioParam(this.attack);
      this.release = new AudioParam(this.release);
    }

    // getters

    get reduction() {
      return super.reduction;
    }
      
    // setters


    // methods

  }

  return DynamicsCompressorNode;
};


  