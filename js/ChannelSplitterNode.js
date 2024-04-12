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

const AudioParam = require('./AudioParam.js');
const {
  kNapiObj,
  kAudioBuffer,
} = require('./lib/symbols.js');
const {
  bridgeEventTarget,
} = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class ChannelSplitterNode extends AudioNode {

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'ChannelSplitterNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'ChannelSplitterNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'ChannelSplitterNode\': argument 2 is not of type \'ChannelSplitterOptions\'');
      }

      if (options && options.numberOfOutputs !== undefined) {
        parsedOptions.numberOfOutputs = conversions['unsigned long'](options.numberOfOutputs, {
          enforceRange: true,
          context: `Failed to construct 'ChannelSplitterNode': Failed to read the 'numberOfOutputs' property from ChannelSplitterOptions: The provided value (${options.numberOfOutputs}})`,
        });
      } else {
        parsedOptions.numberOfOutputs = 6;
      }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'ChannelSplitterNode': Failed to read the 'channelCount' property from ChannelSplitterOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'ChannelSplitterNode': Failed to read the 'channelCount' property from ChannelSplitterOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'ChannelSplitterNode': Failed to read the 'channelInterpretation' property from ChannelSplitterOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.ChannelSplitterNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

    }

  }

  Object.defineProperties(ChannelSplitterNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(ChannelSplitterNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'ChannelSplitterNode',
    },

  });

  return ChannelSplitterNode;
};
