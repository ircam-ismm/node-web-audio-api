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
const {
  kNapiObj,
  kAudioBuffer,
} = require('./lib/symbols.js');
const {
  bridgeEventTarget,
} = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const AudioScheduledSourceNode = require('./AudioScheduledSourceNode.js');

module.exports = (jsExport, nativeBinding) => {
  class OscillatorNode extends AudioScheduledSourceNode {

    #frequency = null;
    #detune = null;

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'OscillatorNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'OscillatorNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'OscillatorNode\': argument 2 is not of type \'OscillatorOptions\'');
      }

      if (options && options.type !== undefined) {
        if (!['sine', 'square', 'sawtooth', 'triangle', 'custom'].includes(options.type)) {
          throw new TypeError(`Failed to construct 'OscillatorNode': Failed to read the 'type' property from OscillatorOptions: The provided value '${options.type}' is not a valid enum value of type OscillatorType`);
        }

        parsedOptions.type = conversions['DOMString'](options.type, {
          context: `Failed to construct 'OscillatorNode': Failed to read the 'type' property from OscillatorOptions: The provided value '${options.type}'`,
        });
      } else {
        parsedOptions.type = 'sine';
      }

      if (options && options.frequency !== undefined) {
        parsedOptions.frequency = conversions['float'](options.frequency, {
          context: `Failed to construct 'OscillatorNode': Failed to read the 'frequency' property from OscillatorOptions: The provided value (${options.frequency}})`,
        });
      } else {
        parsedOptions.frequency = 440;
      }

      if (options && options.detune !== undefined) {
        parsedOptions.detune = conversions['float'](options.detune, {
          context: `Failed to construct 'OscillatorNode': Failed to read the 'detune' property from OscillatorOptions: The provided value (${options.detune}})`,
        });
      } else {
        parsedOptions.detune = 0;
      }

      if (options && options.periodicWave !== undefined) {
        if (!(options.periodicWave instanceof jsExport.PeriodicWave)) {
          throw new TypeError(`Failed to construct 'OscillatorNode': Failed to read the 'periodicWave' property from OscillatorOptions: The provided value '${options.periodicWave}' is not an instance of PeriodicWave`);
        }

        parsedOptions.periodicWave = options.periodicWave[kNapiObj];
      } else {
        parsedOptions.periodicWave = null;
      }

      if (parsedOptions.type === 'custom' && parsedOptions.periodicWave === null) {
        throw new DOMException('Failed to construct \'OscillatorNode\': A PeriodicWave must be specified if the type is set to \'custom\'', 'InvalidStateError');
      }

      if (parsedOptions.periodicWave !== null) {
        parsedOptions.type = 'custom';
      }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'OscillatorNode': Failed to read the 'channelCount' property from OscillatorOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'OscillatorNode': Failed to read the 'channelCount' property from OscillatorOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'OscillatorNode': Failed to read the 'channelInterpretation' property from OscillatorOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.OscillatorNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      // Bridge Rust native event to Node EventTarget
      bridgeEventTarget(this);

      this.#frequency = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].frequency,
      });
      this.#detune = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].detune,
      });
    }

    get frequency() {
      if (!(this instanceof OscillatorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'OscillatorNode\'');
      }

      return this.#frequency;
    }

    get detune() {
      if (!(this instanceof OscillatorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'OscillatorNode\'');
      }

      return this.#detune;
    }

    get type() {
      if (!(this instanceof OscillatorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'OscillatorNode\'');
      }

      return this[kNapiObj].type;
    }

    set type(value) {
      if (!(this instanceof OscillatorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'OscillatorNode\'');
      }

      if (!['sine', 'square', 'sawtooth', 'triangle', 'custom'].includes(value)) {
        console.warn(`Failed to set the 'type' property on 'OscillatorNode': Value '${value}' is not a valid 'OscillatorType' enum value`);
        return;
      }

      try {
        this[kNapiObj].type = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setPeriodicWave(periodicWave) {
      if (!(this instanceof OscillatorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'OscillatorNode\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'setPeriodicWave' on 'OscillatorNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(periodicWave instanceof jsExport.PeriodicWave)) {
        throw new TypeError(`Failed to execute 'setPeriodicWave' on 'OscillatorNode': Parameter 1 is not of type 'PeriodicWave'`);
      }

      periodicWave = periodicWave[kNapiObj];

      try {
        return this[kNapiObj].setPeriodicWave(periodicWave);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  Object.defineProperties(OscillatorNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(OscillatorNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'OscillatorNode',
    },
    frequency: kEnumerableProperty,
    detune: kEnumerableProperty,
    type: kEnumerableProperty,
    setPeriodicWave: kEnumerableProperty,
  });

  return OscillatorNode;
};
