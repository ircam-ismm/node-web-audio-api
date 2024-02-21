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


module.exports = (NativeConvolverNode) => {

  const EventTarget = EventTargetMixin(NativeConvolverNode);
  const AudioNode = AudioNodeMixin(EventTarget);

  class ConvolverNode extends AudioNode {
    constructor(context, options) {
      if (options !== undefined && typeof options !== 'object') {
        throw new TypeError("Failed to construct 'ConvolverNode': argument 2 is not of type 'ConvolverOptions'")
      }

      super(context, options);

    }

    // getters

    get buffer() {
      return super.buffer;
    }

    get normalize() {
      return super.normalize;
    }

    // setters

    set buffer(value) {
      try {
        super.buffer = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set normalize(value) {
      try {
        super.normalize = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    // methods
    
  }

  return ConvolverNode;
};


  