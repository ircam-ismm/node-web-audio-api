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

export class WaveShaperNode extends AudioNode {

  constructor(context, options) {

    if (arguments.length < 1) {
      throw new TypeError(`Failed to construct 'WaveShaperNode': 1 argument required, but only ${arguments.length} present`);
    }

    if (!(context instanceof BaseAudioContext)) {
      throw new TypeError(`Failed to construct 'WaveShaperNode': argument 1 is not of type BaseAudioContext`);
    }

    const parsedOptions = {};

    if (options && typeof options !== 'object') {
      throw new TypeError('Failed to construct \'WaveShaperNode\': argument 2 is not of type \'WaveShaperOptions\'');
    }

    if (options && options.curve !== undefined) {
      try {
        parsedOptions.curve = toSanitizedSequence(options.curve, Float32Array);
      } catch (err) {
        throw new TypeError(`Failed to construct 'WaveShaperNode': Failed to read the 'curve' property from WaveShaperOptions: The provided value ${err.message}`);
      }
    } else {
      parsedOptions.curve = null;
    }

    if (options && options.oversample !== undefined) {
      if (!['none', '2x', '4x'].includes(options.oversample)) {
        throw new TypeError(`Failed to construct 'WaveShaperNode': Failed to read the 'oversample' property from WaveShaperOptions: The provided value '${options.oversample}' is not a valid enum value of type OverSampleType`);
      }

      parsedOptions.oversample = conversions['DOMString'](options.oversample, {
        context: `Failed to construct 'WaveShaperNode': Failed to read the 'oversample' property from WaveShaperOptions: The provided value '${options.oversample}'`,
      });
    } else {
      parsedOptions.oversample = 'none';
    }

    if (options && options.channelCount !== undefined) {
      parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
        enforceRange: true,
        context: `Failed to construct 'WaveShaperNode': Failed to read the 'channelCount' property from WaveShaperOptions: The provided value '${options.channelCount}'`,
      });
    }

    if (options && options.channelCountMode !== undefined) {
      parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
        context: `Failed to construct 'WaveShaperNode': Failed to read the 'channelCount' property from WaveShaperOptions: The provided value '${options.channelCountMode}'`,
      });
    }

    if (options && options.channelInterpretation !== undefined) {
      parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
        context: `Failed to construct 'WaveShaperNode': Failed to read the 'channelInterpretation' property from WaveShaperOptions: The provided value '${options.channelInterpretation}'`,
      });
    }

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiWaveShaperNode(context[kNapiObj], parsedOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super(context, {
      [kNapiObj]: napiObj,
    });

  }

  get curve() {
    if (!(this instanceof WaveShaperNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'WaveShaperNode\'');
    }

    return this[kNapiObj].curve;
  }

  set curve(value) {
    if (!(this instanceof WaveShaperNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'WaveShaperNode\'');
    }

    if (value === null) {
      console.warn('Setting the \'curve\' property on \'WaveShaperNode\' to \'null\' is not supported yet');
      return;
    } else if (!(value instanceof Float32Array)) {
      throw new TypeError('Failed to set the \'curve\' property on \'WaveShaperNode\': Value is not a valid \'Float32Array\' value');
    }

    try {
      this[kNapiObj].curve = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  get oversample() {
    if (!(this instanceof WaveShaperNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'WaveShaperNode\'');
    }

    return this[kNapiObj].oversample;
  }

  set oversample(value) {
    if (!(this instanceof WaveShaperNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'WaveShaperNode\'');
    }

    if (!['none', '2x', '4x'].includes(value)) {
      console.warn(`Failed to set the 'oversample' property on 'WaveShaperNode': Value '${value}' is not a valid 'OverSampleType' enum value`);
      return;
    }

    try {
      this[kNapiObj].oversample = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

}

Object.defineProperties(WaveShaperNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 1,
  },
});

Object.defineProperties(WaveShaperNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'WaveShaperNode',
  },

  curve: kEnumerableProperty,
  oversample: kEnumerableProperty,

});
