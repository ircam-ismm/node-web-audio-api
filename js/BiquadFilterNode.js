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
import conversions from 'webidl-conversions';

import nativeBinding from '../load-native.cjs';
import {
  toSanitizedSequence,
} from './lib/cast.js';
import {
  isFunction,
  kEnumerableProperty,
} from './lib/utils.js';
import {
  throwSanitizedError,
} from './lib/errors.js';
import {
  kNapiObj,
  kAudioBuffer,
} from './lib/symbols.js';

import {
  AudioParam,
} from './AudioParam.js';
import {
  AudioBuffer,
} from './AudioBuffer.js';
import {
  PeriodicWave,
} from './PeriodicWave.js';

import {
  BaseAudioContext,
} from './BaseAudioContext.js';

/* eslint-enable no-unused-vars */

import {
  AudioNode,
} from './AudioNode.js';

export class BiquadFilterNode extends AudioNode {

  #frequency = null;
  #detune = null;
  #Q = null;
  #gain = null;

  constructor(context, options) {

    if (arguments.length < 1) {
      throw new TypeError(`Failed to construct 'BiquadFilterNode': 1 argument required, but only ${arguments.length} present`);
    }

    if (!(context instanceof BaseAudioContext)) {
      throw new TypeError(`Failed to construct 'BiquadFilterNode': argument 1 is not of type BaseAudioContext`);
    }

    const parsedOptions = {};

    if (options && typeof options !== 'object') {
      throw new TypeError('Failed to construct \'BiquadFilterNode\': argument 2 is not of type \'BiquadFilterOptions\'');
    }

    if (options && options.type !== undefined) {
      if (!['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'].includes(options.type)) {
        throw new TypeError(`Failed to construct 'BiquadFilterNode': Failed to read the 'type' property from BiquadFilterOptions: The provided value '${options.type}' is not a valid enum value of type BiquadFilterType`);
      }

      parsedOptions.type = conversions['DOMString'](options.type, {
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'type' property from BiquadFilterOptions: The provided value '${options.type}'`,
      });
    } else {
      parsedOptions.type = 'lowpass';
    }

    if (options && options.Q !== undefined) {
      parsedOptions.Q = conversions['float'](options.Q, {
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'Q' property from BiquadFilterOptions: The provided value (${options.Q}})`,
      });
    } else {
      parsedOptions.Q = 1;
    }

    if (options && options.detune !== undefined) {
      parsedOptions.detune = conversions['float'](options.detune, {
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'detune' property from BiquadFilterOptions: The provided value (${options.detune}})`,
      });
    } else {
      parsedOptions.detune = 0;
    }

    if (options && options.frequency !== undefined) {
      parsedOptions.frequency = conversions['float'](options.frequency, {
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'frequency' property from BiquadFilterOptions: The provided value (${options.frequency}})`,
      });
    } else {
      parsedOptions.frequency = 350;
    }

    if (options && options.gain !== undefined) {
      parsedOptions.gain = conversions['float'](options.gain, {
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'gain' property from BiquadFilterOptions: The provided value (${options.gain}})`,
      });
    } else {
      parsedOptions.gain = 0;
    }

    if (options && options.channelCount !== undefined) {
      parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
        enforceRange: true,
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'channelCount' property from BiquadFilterOptions: The provided value '${options.channelCount}'`,
      });
    }

    if (options && options.channelCountMode !== undefined) {
      parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'channelCount' property from BiquadFilterOptions: The provided value '${options.channelCountMode}'`,
      });
    }

    if (options && options.channelInterpretation !== undefined) {
      parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
        context: `Failed to construct 'BiquadFilterNode': Failed to read the 'channelInterpretation' property from BiquadFilterOptions: The provided value '${options.channelInterpretation}'`,
      });
    }

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiBiquadFilterNode(context[kNapiObj], parsedOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super(context, {
      [kNapiObj]: napiObj,
    });

    this.#frequency = new AudioParam({
      [kNapiObj]: this[kNapiObj].frequency,
    });
    this.#detune = new AudioParam({
      [kNapiObj]: this[kNapiObj].detune,
    });
    this.#Q = new AudioParam({
      [kNapiObj]: this[kNapiObj].Q,
    });
    this.#gain = new AudioParam({
      [kNapiObj]: this[kNapiObj].gain,
    });
  }

  get frequency() {
    if (!(this instanceof BiquadFilterNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BiquadFilterNode\'');
    }

    return this.#frequency;
  }

  get detune() {
    if (!(this instanceof BiquadFilterNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BiquadFilterNode\'');
    }

    return this.#detune;
  }

  get Q() {
    if (!(this instanceof BiquadFilterNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BiquadFilterNode\'');
    }

    return this.#Q;
  }

  get gain() {
    if (!(this instanceof BiquadFilterNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BiquadFilterNode\'');
    }

    return this.#gain;
  }

  get type() {
    if (!(this instanceof BiquadFilterNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BiquadFilterNode\'');
    }

    return this[kNapiObj].type;
  }

  set type(value) {
    if (!(this instanceof BiquadFilterNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BiquadFilterNode\'');
    }

    if (!['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'].includes(value)) {
      console.warn(`Failed to set the 'type' property on 'BiquadFilterNode': Value '${value}' is not a valid 'BiquadFilterType' enum value`);
      return;
    }

    try {
      this[kNapiObj].type = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    if (!(this instanceof BiquadFilterNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BiquadFilterNode\'');
    }

    if (arguments.length < 3) {
      throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'BiquadFilterNode': 3 argument required, but only ${arguments.length} present`);
    }

    if (!(frequencyHz instanceof Float32Array)) {
      throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'BiquadFilterNode': Parameter 1 is not of type 'Float32Array'`);
    }

    if (!(magResponse instanceof Float32Array)) {
      throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'BiquadFilterNode': Parameter 2 is not of type 'Float32Array'`);
    }

    if (!(phaseResponse instanceof Float32Array)) {
      throw new TypeError(`Failed to execute 'getFrequencyResponse' on 'BiquadFilterNode': Parameter 3 is not of type 'Float32Array'`);
    }

    try {
      return this[kNapiObj].getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

}

Object.defineProperties(BiquadFilterNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 1,
  },
});

Object.defineProperties(BiquadFilterNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'BiquadFilterNode',
  },
  frequency: kEnumerableProperty,
  detune: kEnumerableProperty,
  Q: kEnumerableProperty,
  gain: kEnumerableProperty,
  type: kEnumerableProperty,
  getFrequencyResponse: kEnumerableProperty,
});
