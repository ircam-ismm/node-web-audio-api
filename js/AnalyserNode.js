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

module.exports = (NativeAnalyserNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeAnalyserNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class AnalyserNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'AnalyserNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'AnalyserNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'AnalyserNode\': argument 2 is not of type \'AnalyserOptions\'');
      }

      if (options && 'fftSize' in options) {
        parsedOptions.fftSize = conversions['unsigned long'](options.fftSize, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'fftSize' property from AnalyserOptions: The provided value (${options.fftSize}})`,
        });
      } else {
        parsedOptions.fftSize = 2048;
      }

      if (options && 'maxDecibels' in options) {
        parsedOptions.maxDecibels = conversions['double'](options.maxDecibels, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'maxDecibels' property from AnalyserOptions: The provided value (${options.maxDecibels}})`,
        });
      } else {
        parsedOptions.maxDecibels = -30;
      }

      if (options && 'minDecibels' in options) {
        parsedOptions.minDecibels = conversions['double'](options.minDecibels, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'minDecibels' property from AnalyserOptions: The provided value (${options.minDecibels}})`,
        });
      } else {
        parsedOptions.minDecibels = -100;
      }

      if (options && 'smoothingTimeConstant' in options) {
        parsedOptions.smoothingTimeConstant = conversions['double'](options.smoothingTimeConstant, {
          context: `Failed to construct 'AnalyserNode': Failed to read the 'smoothingTimeConstant' property from AnalyserOptions: The provided value (${options.smoothingTimeConstant}})`,
        });
      } else {
        parsedOptions.smoothingTimeConstant = 0.8;
      }

      super(context, parsedOptions);

    }

    get fftSize() {
      return super.fftSize;
    }

    get frequencyBinCount() {
      return super.frequencyBinCount;
    }

    get minDecibels() {
      return super.minDecibels;
    }

    get maxDecibels() {
      return super.maxDecibels;
    }

    get smoothingTimeConstant() {
      return super.smoothingTimeConstant;
    }

    set fftSize(value) {
      try {
        super.fftSize = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set minDecibels(value) {
      try {
        super.minDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set maxDecibels(value) {
      try {
        super.maxDecibels = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set smoothingTimeConstant(value) {
      try {
        super.smoothingTimeConstant = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getFloatFrequencyData(...args) {
      try {
        return super.getFloatFrequencyData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getByteFrequencyData(...args) {
      try {
        return super.getByteFrequencyData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getFloatTimeDomainData(...args) {
      try {
        return super.getFloatTimeDomainData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getByteTimeDomainData(...args) {
      try {
        return super.getByteTimeDomainData(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return AnalyserNode;
};
