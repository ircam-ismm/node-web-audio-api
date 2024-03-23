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

module.exports = (NativeDynamicsCompressorNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeDynamicsCompressorNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class DynamicsCompressorNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'DynamicsCompressorNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'DynamicsCompressorNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'DynamicsCompressorNode\': argument 2 is not of type \'DynamicsCompressorOptions\'');
      }

      if (options && 'attack' in options) {
        parsedOptions.attack = conversions['float'](options.attack, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'attack' property from DynamicsCompressorOptions: The provided value (${options.attack}})`,
        });
      } else {
        parsedOptions.attack = 0.003;
      }

      if (options && 'knee' in options) {
        parsedOptions.knee = conversions['float'](options.knee, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'knee' property from DynamicsCompressorOptions: The provided value (${options.knee}})`,
        });
      } else {
        parsedOptions.knee = 30;
      }

      if (options && 'ratio' in options) {
        parsedOptions.ratio = conversions['float'](options.ratio, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'ratio' property from DynamicsCompressorOptions: The provided value (${options.ratio}})`,
        });
      } else {
        parsedOptions.ratio = 12;
      }

      if (options && 'release' in options) {
        parsedOptions.release = conversions['float'](options.release, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'release' property from DynamicsCompressorOptions: The provided value (${options.release}})`,
        });
      } else {
        parsedOptions.release = 0.25;
      }

      if (options && 'threshold' in options) {
        parsedOptions.threshold = conversions['float'](options.threshold, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'threshold' property from DynamicsCompressorOptions: The provided value (${options.threshold}})`,
        });
      } else {
        parsedOptions.threshold = -24;
      }

      super(context, parsedOptions);

      this.threshold = new AudioParam(this.threshold);
      this.knee = new AudioParam(this.knee);
      this.ratio = new AudioParam(this.ratio);
      this.attack = new AudioParam(this.attack);
      this.release = new AudioParam(this.release);
    }

    get reduction() {
      return super.reduction;
    }

  }

  return DynamicsCompressorNode;
};
