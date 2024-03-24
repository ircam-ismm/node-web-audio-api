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
/* eslint-enable no-unused-vars */

const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');

module.exports = (NativeDelayNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeDelayNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class DelayNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'DelayNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
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

      super(context, parsedOptions);

      this.delayTime = new AudioParam(this.delayTime);
    }

  }

  return DelayNode;
};
