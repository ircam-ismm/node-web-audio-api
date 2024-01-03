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

    // methods
    
    start(...args) {
      try {
        return super.start(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    stop(...args) {
      try {
        return super.stop(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return AudioScheduledSourceNode;
}

  