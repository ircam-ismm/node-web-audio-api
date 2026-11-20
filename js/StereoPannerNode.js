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

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

import {
  BaseAudioContext,
} from './BaseAudioContext.js';

/* eslint-enable no-unused-vars */

import {
  AudioNode,
} from './AudioNode.js';

export class StereoPannerNode extends AudioNode {

  #pan = null;

  constructor(context, options) {

    if (arguments.length < 1) {
      throw new TypeError(`Failed to construct 'StereoPannerNode': 1 argument required, but only ${arguments.length} present`);
    }

    if (!(context instanceof BaseAudioContext)) {
      throw new TypeError(`Failed to construct 'StereoPannerNode': argument 1 is not of type BaseAudioContext`);
    }

    const parsedOptions = {};

    if (options && typeof options !== 'object') {
      throw new TypeError('Failed to construct \'StereoPannerNode\': argument 2 is not of type \'StereoPannerOptions\'');
    }

    if (options && options.pan !== undefined) {
      parsedOptions.pan = conversions['float'](options.pan, {
        context: `Failed to construct 'StereoPannerNode': Failed to read the 'pan' property from StereoPannerOptions: The provided value (${options.pan}})`,
      });
    } else {
      parsedOptions.pan = 0;
    }

    if (options && options.channelCount !== undefined) {
      parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
        enforceRange: true,
        context: `Failed to construct 'StereoPannerNode': Failed to read the 'channelCount' property from StereoPannerOptions: The provided value '${options.channelCount}'`,
      });
    }

    if (options && options.channelCountMode !== undefined) {
      parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
        context: `Failed to construct 'StereoPannerNode': Failed to read the 'channelCount' property from StereoPannerOptions: The provided value '${options.channelCountMode}'`,
      });
    }

    if (options && options.channelInterpretation !== undefined) {
      parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
        context: `Failed to construct 'StereoPannerNode': Failed to read the 'channelInterpretation' property from StereoPannerOptions: The provided value '${options.channelInterpretation}'`,
      });
    }

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiStereoPannerNode(context[kNapiObj], parsedOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super(context, {
      [kNapiObj]: napiObj,
    });

    this.#pan = new AudioParam({
      [kNapiObj]: this[kNapiObj].pan,
    });
  }

  get pan() {
    if (!(this instanceof StereoPannerNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'StereoPannerNode\'');
    }

    return this.#pan;
  }

  [customInspectSymbol]() {
    return `${this.constructor.name} { pan: ${this.pan} }`;
  }

}

Object.defineProperties(StereoPannerNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 1,
  },
});

Object.defineProperties(StereoPannerNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'StereoPannerNode',
  },
  pan: kEnumerableProperty,

});
