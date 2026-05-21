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

import nativeBinding from '../load-native.js';
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

export class GainNode extends AudioNode {

  #gain = null;

  constructor(context, options) {

    if (arguments.length < 1) {
      throw new TypeError(`Failed to construct 'GainNode': 1 argument required, but only ${arguments.length} present`);
    }

    if (!(context instanceof BaseAudioContext)) {
      throw new TypeError(`Failed to construct 'GainNode': argument 1 is not of type BaseAudioContext`);
    }

    const parsedOptions = {};

    if (options && typeof options !== 'object') {
      throw new TypeError('Failed to construct \'GainNode\': argument 2 is not of type \'GainOptions\'');
    }

    if (options && options.gain !== undefined) {
      parsedOptions.gain = conversions['float'](options.gain, {
        context: `Failed to construct 'GainNode': Failed to read the 'gain' property from GainOptions: The provided value (${options.gain}})`,
      });
    } else {
      parsedOptions.gain = 1.0;
    }

    if (options && options.channelCount !== undefined) {
      parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
        enforceRange: true,
        context: `Failed to construct 'GainNode': Failed to read the 'channelCount' property from GainOptions: The provided value '${options.channelCount}'`,
      });
    }

    if (options && options.channelCountMode !== undefined) {
      parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
        context: `Failed to construct 'GainNode': Failed to read the 'channelCount' property from GainOptions: The provided value '${options.channelCountMode}'`,
      });
    }

    if (options && options.channelInterpretation !== undefined) {
      parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
        context: `Failed to construct 'GainNode': Failed to read the 'channelInterpretation' property from GainOptions: The provided value '${options.channelInterpretation}'`,
      });
    }

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiGainNode(context[kNapiObj], parsedOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super(context, {
      [kNapiObj]: napiObj,
    });

    this.#gain = new AudioParam({
      [kNapiObj]: this[kNapiObj].gain,
    });
  }

  get gain() {
    if (!(this instanceof GainNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'GainNode\'');
    }

    return this.#gain;
  }

}

Object.defineProperties(GainNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 1,
  },
});

Object.defineProperties(GainNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'GainNode',
  },
  gain: kEnumerableProperty,

});
