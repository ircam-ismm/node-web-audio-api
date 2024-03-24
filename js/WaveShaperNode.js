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

module.exports = (NativeWaveShaperNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeWaveShaperNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class WaveShaperNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'WaveShaperNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'WaveShaperNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'WaveShaperNode\': argument 2 is not of type \'WaveShaperOptions\'');
      }

      if (options && 'curve' in options) {
        try {
          parsedOptions.curve = toSanitizedSequence(options.curve, Float32Array);
        } catch (err) {
          throw new TypeError(' `Failed to construct \'WaveShaperNode\': Failed to read the \'curve\' property from WaveShaperOptions: The provided value ${err.message}');
        }
      } else {
        parsedOptions.curve = null;
      }

      if (options && 'oversample' in options) {
        if (!['none', '2x', '4x'].includes(options.oversample)) {
          throw new TypeError(`Failed to construct 'WaveShaperNode': Failed to read the 'oversample' property from WaveShaperOptions: The provided value '${options.oversample}' is not a valid enum value of type OverSampleType`);
        }

        parsedOptions.oversample = options.oversample;
      } else {
        parsedOptions.oversample = 'none';
      }

      super(context, parsedOptions);

    }

    get curve() {
      return super.curve;
    }

    get oversample() {
      return super.oversample;
    }

    set curve(value) {
      try {
        super.curve = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set oversample(value) {
      try {
        super.oversample = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return WaveShaperNode;
};
