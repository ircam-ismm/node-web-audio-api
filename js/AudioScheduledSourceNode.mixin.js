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

module.exports = (superclass) => {
  class AudioScheduledSourceNode extends superclass {
    // getters

    get onended() {
      return super.onended
    }

    // setters

    set onended(value) {
      try {
        super.onended = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    // methods
    
    start(...args) {
      try {
        super.start(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    stop(...args) {
      try {
        super.stop(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return AudioScheduledSourceNode;
}

  