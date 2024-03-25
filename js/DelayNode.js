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
} = require('./lib/utils.js');
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
const {
  bridgeEventTarget,
} = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class DelayNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'DelayNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.AudioContext) && !(context instanceof jsExport.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'DelayNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'DelayNode\': argument 2 is not of type \'DelayOptions\'');
      }

      if (options && 'maxDelayTime' in options) {
        parsedOptions.maxDelayTime = conversions['double'](options.maxDelayTime, {
          context: `Failed to construct 'DelayNode': Failed to read the 'maxDelayTime' property from DelayOptions: The provided value (${options.maxDelayTime}})`,
        });
      } else {
        parsedOptions.maxDelayTime = 1;
      }

      if (options && 'delayTime' in options) {
        parsedOptions.delayTime = conversions['double'](options.delayTime, {
          context: `Failed to construct 'DelayNode': Failed to read the 'delayTime' property from DelayOptions: The provided value (${options.delayTime}})`,
        });
      } else {
        parsedOptions.delayTime = 0;
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.DelayNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

      this.delayTime = new AudioParam(this[kNapiObj].delayTime);
    }

  }

  return DelayNode;
};
