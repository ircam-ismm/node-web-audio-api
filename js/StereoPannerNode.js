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

module.exports = (NativeStereoPannerNode) => {
  const EventTarget = EventTargetMixin(NativeStereoPannerNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class StereoPannerNode extends AudioNode {
    constructor(context, options) {
      // keep a handle to the original object, if we need to manipulate the
      // options before passing them to NAPI
      const originalOptions = Object.assign({}, options);

      
      if (options !== undefined) {
        if (typeof options !== 'object') {
          throw new TypeError("Failed to construct 'StereoPannerNode': argument 2 is not of type 'StereoPannerOptions'")
        }
        
      }
        

      super(context, options);

      

      

      
      this.pan = new AudioParam(this.pan);
    }

    // getters

    // setters


    // methods

  }

  return StereoPannerNode;
};


  