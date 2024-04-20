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

/* eslint-disable no-unused-vars */
const conversions = require('webidl-conversions');
const {
  toSanitizedSequence,
} = require('./lib/cast.js');
const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kNapiObj,
  kAudioBuffer,
} = require('./lib/symbols.js');
/* eslint-enable no-unused-vars */

const AudioScheduledSourceNode = require('./AudioScheduledSourceNode.js');

module.exports = (jsExport, nativeBinding) => {
  class ConstantSourceNode extends AudioScheduledSourceNode {

    #offset = null;

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'ConstantSourceNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'ConstantSourceNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'ConstantSourceNode\': argument 2 is not of type \'ConstantSourceOptions\'');
      }

      if (options && options.offset !== undefined) {
        parsedOptions.offset = conversions['float'](options.offset, {
          context: `Failed to construct 'ConstantSourceNode': Failed to read the 'offset' property from ConstantSourceOptions: The provided value (${options.offset}})`,
        });
      } else {
        parsedOptions.offset = 1;
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.ConstantSourceNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      this.#offset = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].offset,
      });
    }

    get offset() {
      if (!(this instanceof ConstantSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConstantSourceNode\'');
      }

      return this.#offset;
    }

  }

  Object.defineProperties(ConstantSourceNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(ConstantSourceNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'ConstantSourceNode',
    },
    offset: kEnumerableProperty,

  });

  return ConstantSourceNode;
};
