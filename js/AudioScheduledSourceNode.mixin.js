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

const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  isFunction,
} = require('./lib/utils.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');

const AudioNode = require('./AudioNode.mixin.js');

class AudioScheduledSourceNode extends AudioNode {
  constructor(context, napiObj) {
    super(context, napiObj);
  }

  get onended() {
    return this._onended || null;
  }

  set onended(value) {
    if (isFunction(value) || value === null) {
      this._onended = value;
    }
  }

  start(...args) {
    try {
      return this[kNapiObj].start(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  stop(...args) {
    try {
      return this[kNapiObj].stop(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

}

module.exports = AudioScheduledSourceNode;
