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


module.exports = (NativeConvolverNode) => {

  const EventTarget = EventTargetMixin(NativeConvolverNode);
  const AudioNode = AudioNodeMixin(EventTarget);

  class ConvolverNode extends AudioNode {
    constructor(context, options) {
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


  