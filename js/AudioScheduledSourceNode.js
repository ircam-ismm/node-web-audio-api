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
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');

const AudioNode = require('./AudioNode.js');

class AudioScheduledSourceNode extends AudioNode {
  constructor(context, napiObj) {
    super(context, napiObj);
  }

  get onended() {
    return this._onended || null;
  }

  set onended(value) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
    }

    if (isFunction(value) || value === null) {
      this._onended = value;
    }
  }

  start(...args) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
    }

    try {
      return this[kNapiObj].start(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  stop(...args) {
    if (!(this instanceof AudioScheduledSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
    }

    try {
      return this[kNapiObj].stop(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

}

Object.defineProperties(AudioScheduledSourceNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioScheduledSourceNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioScheduledSourceNode',
  },

  onended: kEnumerableProperty,

  start: kEnumerableProperty,
  stop: kEnumerableProperty,
});

Object.defineProperties(AudioScheduledSourceNode.prototype.start, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioScheduledSourceNode.prototype.stop, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

module.exports = AudioScheduledSourceNode;
