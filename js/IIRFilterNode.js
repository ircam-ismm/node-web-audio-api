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
  kNativeAudioBuffer,
  kAudioBuffer,
} = require('./AudioBuffer.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');
const {
  bridgeEventTarget,
} = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class IIRFilterNode extends AudioNode {

    constructor(context, options) {

      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'IIRFilterNode': 2 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'IIRFilterNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'IIRFilterNode\': argument 2 is not of type \'IIRFilterOptions\'');
      }

      // required options
      if (typeof options !== 'object' || (options && options.feedforward === undefined)) {
        throw new TypeError('Failed to construct \'IIRFilterNode\': Failed to read the \'feedforward\'\' property from IIRFilterOptions: Required member is undefined');
      }

      if (options && options.feedforward !== undefined) {
        try {
          parsedOptions.feedforward = toSanitizedSequence(options.feedforward, Float64Array);
        } catch (err) {
          throw new TypeError(`Failed to construct 'IIRFilterNode': Failed to read the 'feedforward' property from IIRFilterOptions: The provided value ${err.message}`);
        }
      } else {
        parsedOptions.feedforward = null;
      }

      // required options
      if (typeof options !== 'object' || (options && options.feedback === undefined)) {
        throw new TypeError('Failed to construct \'IIRFilterNode\': Failed to read the \'feedback\'\' property from IIRFilterOptions: Required member is undefined');
      }

      if (options && options.feedback !== undefined) {
        try {
          parsedOptions.feedback = toSanitizedSequence(options.feedback, Float64Array);
        } catch (err) {
          throw new TypeError(`Failed to construct 'IIRFilterNode': Failed to read the 'feedback' property from IIRFilterOptions: The provided value ${err.message}`);
        }
      } else {
        parsedOptions.feedback = null;
      }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'IIRFilterNode': Failed to read the 'channelCount' property from IIRFilterOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'IIRFilterNode': Failed to read the 'channelCount' property from IIRFilterOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'IIRFilterNode': Failed to read the 'channelInterpretation' property from IIRFilterOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.IIRFilterNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

    }

    getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
      if (!(this instanceof IIRFilterNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'IIRFilterNode\'');
      }

      if (arguments.length < 3) {
        throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'IIRFilterNode': 3 argument required, but only ${arguments.length} present`);
      }

      if (!(frequencyHz instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'IIRFilterNode': Parameter 1 is not of type 'Float32Array'`);
      }

      if (!(magResponse instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'IIRFilterNode': Parameter 2 is not of type 'Float32Array'`);
      }

      if (!(phaseResponse instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'IIRFilterNode': Parameter 3 is not of type 'Float32Array'`);
      }

      try {
        return this[kNapiObj].getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  Object.defineProperties(IIRFilterNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 2,
    },
  });

  Object.defineProperties(IIRFilterNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'IIRFilterNode',
    },

    getFrequencyResponse: kEnumerableProperty,
  });

  return IIRFilterNode;
};
