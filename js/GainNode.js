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

module.exports = (NativeGainNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeGainNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class GainNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'GainNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'GainNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'GainNode\': argument 2 is not of type \'GainOptions\'');
      }

      if (options && 'gain' in options) {
        parsedOptions.gain = conversions['float'](options.gain, {
          context: `Failed to construct 'GainNode': Failed to read the 'gain' property from GainOptions: The provided value (${options.gain}})`,
        });
      } else {
        parsedOptions.gain = 1.0;
      }

      super(context, parsedOptions);

      this.gain = new AudioParam(this.gain);
    }

  }

  return GainNode;
};
