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
  class BiquadFilterNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'BiquadFilterNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.AudioContext) && !(context instanceof jsExport.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'BiquadFilterNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'BiquadFilterNode\': argument 2 is not of type \'BiquadFilterOptions\'');
      }

      if (options && 'type' in options) {
        if (!['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'].includes(options.type)) {
          throw new TypeError(`Failed to construct 'BiquadFilterNode': Failed to read the 'type' property from BiquadFilterOptions: The provided value '${options.type}' is not a valid enum value of type BiquadFilterType`);
        }

        parsedOptions.type = options.type;
      } else {
        parsedOptions.type = 'lowpass';
      }

      if (options && 'Q' in options) {
        parsedOptions.Q = conversions['float'](options.Q, {
          context: `Failed to construct 'BiquadFilterNode': Failed to read the 'Q' property from BiquadFilterOptions: The provided value (${options.Q}})`,
        });
      } else {
        parsedOptions.Q = 1;
      }

      if (options && 'detune' in options) {
        parsedOptions.detune = conversions['float'](options.detune, {
          context: `Failed to construct 'BiquadFilterNode': Failed to read the 'detune' property from BiquadFilterOptions: The provided value (${options.detune}})`,
        });
      } else {
        parsedOptions.detune = 0;
      }

      if (options && 'frequency' in options) {
        parsedOptions.frequency = conversions['float'](options.frequency, {
          context: `Failed to construct 'BiquadFilterNode': Failed to read the 'frequency' property from BiquadFilterOptions: The provided value (${options.frequency}})`,
        });
      } else {
        parsedOptions.frequency = 350;
      }

      if (options && 'gain' in options) {
        parsedOptions.gain = conversions['float'](options.gain, {
          context: `Failed to construct 'BiquadFilterNode': Failed to read the 'gain' property from BiquadFilterOptions: The provided value (${options.gain}})`,
        });
      } else {
        parsedOptions.gain = 0;
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.BiquadFilterNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

      this.frequency = new AudioParam(this[kNapiObj].frequency);
      this.detune = new AudioParam(this[kNapiObj].detune);
      this.Q = new AudioParam(this[kNapiObj].Q);
      this.gain = new AudioParam(this[kNapiObj].gain);
    }

    get type() {
      return this[kNapiObj].type;
    }

    set type(value) {
      try {
        this[kNapiObj].type = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getFrequencyResponse(...args) {
      try {
        return this[kNapiObj].getFrequencyResponse(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return BiquadFilterNode;
};
