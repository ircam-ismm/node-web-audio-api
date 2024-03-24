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
const AudioScheduledSourceNodeMixin = require('./AudioScheduledSourceNode.mixin.js');

module.exports = (NativeOscillatorNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativeOscillatorNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);
  const AudioScheduledSourceNode = AudioScheduledSourceNodeMixin(AudioNode);

  class OscillatorNode extends AudioScheduledSourceNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'OscillatorNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'OscillatorNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'OscillatorNode\': argument 2 is not of type \'OscillatorOptions\'');
      }

      if (options && 'type' in options) {
        if (!['sine', 'square', 'sawtooth', 'triangle', 'custom'].includes(options.type)) {
          throw new TypeError(`Failed to construct 'OscillatorNode': Failed to read the 'type' property from OscillatorOptions: The provided value '${options.type}' is not a valid enum value of type OscillatorType`);
        }

        parsedOptions.type = options.type;
      } else {
        parsedOptions.type = 'sine';
      }

      if (options && 'frequency' in options) {
        parsedOptions.frequency = conversions['float'](options.frequency, {
          context: `Failed to construct 'OscillatorNode': Failed to read the 'frequency' property from OscillatorOptions: The provided value (${options.frequency}})`,
        });
      } else {
        parsedOptions.frequency = 440;
      }

      if (options && 'detune' in options) {
        parsedOptions.detune = conversions['float'](options.detune, {
          context: `Failed to construct 'OscillatorNode': Failed to read the 'detune' property from OscillatorOptions: The provided value (${options.detune}})`,
        });
      } else {
        parsedOptions.detune = 0;
      }

      if (options && 'periodicWave' in options) {
        if (!(options.periodicWave instanceof nativeBinding.PeriodicWave)) {
          throw new TypeError(`Failed to construct 'OscillatorNode': Failed to read the 'periodicWave' property from OscillatorOptions: The provided value '${options.periodicWave}' is not an instance of PeriodicWave`);
        }

        parsedOptions.periodicWave = options.periodicWave;
      } else {
        parsedOptions.periodicWave = null;
      }

      super(context, parsedOptions);

      // EventTargetMixin constructor has been called so EventTargetMixin[kDispatchEvent]
      // is bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();

      this.frequency = new AudioParam(this.frequency);
      this.detune = new AudioParam(this.detune);
    }

    get type() {
      return super.type;
    }

    set type(value) {
      try {
        super.type = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setPeriodicWave(...args) {
      try {
        return super.setPeriodicWave(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return OscillatorNode;
};
