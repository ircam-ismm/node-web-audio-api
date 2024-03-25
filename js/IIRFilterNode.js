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
  throwSanitizedError,
} = require('./lib/errors.js');

const {
  AudioParam,
} = require('./AudioParam.js');
const {
  kNativeAudioBuffer,
  kAudioBuffer,
} = require('./AudioBuffer.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class IIRFilterNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'IIRFilterNode': 2 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.AudioContext) && !(context instanceof jsExport.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'IIRFilterNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'IIRFilterNode\': argument 2 is not of type \'IIRFilterOptions\'');
      }

      // required options
      if (typeof options !== 'object' || (options && !('feedforward' in options))) {
        throw new TypeError('Failed to construct \'IIRFilterNode\': Failed to read the \'feedforward\'\' property from IIRFilterOptions: Required member is undefined');
      }

      if (options && 'feedforward' in options) {
        try {
          parsedOptions.feedforward = toSanitizedSequence(options.feedforward, Float64Array);
        } catch (err) {
          throw new TypeError(' `Failed to construct \'IIRFilterNode\': Failed to read the \'feedforward\' property from IIRFilterOptions: The provided value ${err.message}');
        }
      } else {
        parsedOptions.feedforward = null;
      }

      // required options
      if (typeof options !== 'object' || (options && !('feedback' in options))) {
        throw new TypeError('Failed to construct \'IIRFilterNode\': Failed to read the \'feedback\'\' property from IIRFilterOptions: Required member is undefined');
      }

      if (options && 'feedback' in options) {
        try {
          parsedOptions.feedback = toSanitizedSequence(options.feedback, Float64Array);
        } catch (err) {
          throw new TypeError(' `Failed to construct \'IIRFilterNode\': Failed to read the \'feedback\' property from IIRFilterOptions: The provided value ${err.message}');
        }
      } else {
        parsedOptions.feedback = null;
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.IIRFilterNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

    }

    getFrequencyResponse(...args) {
      try {
        return this[kNapiObj].getFrequencyResponse(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return IIRFilterNode;
};
