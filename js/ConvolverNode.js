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

export class ConvolverNode extends AudioNode {

  constructor(context, options) {

    if (arguments.length < 1) {
      throw new TypeError(`Failed to construct 'ConvolverNode': 1 argument required, but only ${arguments.length} present`);
    }

    if (!(context instanceof BaseAudioContext)) {
      throw new TypeError(`Failed to construct 'ConvolverNode': argument 1 is not of type BaseAudioContext`);
    }

    const parsedOptions = {};

    if (options && typeof options !== 'object') {
      throw new TypeError('Failed to construct \'ConvolverNode\': argument 2 is not of type \'ConvolverOptions\'');
    }

    if (options && options.buffer !== undefined) {
      if (options.buffer !== null) {
        if (!(options.buffer instanceof AudioBuffer)) {
          throw new TypeError('Failed to construct \'ConvolverNode\': Failed to read the \'buffer\' property from ConvolverOptions: The provided value cannot be converted to \'AudioBuffer\'');
        }

        parsedOptions.buffer = options.buffer[kNapiObj];
      } else {
        parsedOptions.buffer = null;
      }
    } else {
      parsedOptions.buffer = null;
    }

    if (options && options.disableNormalization !== undefined) {
      parsedOptions.disableNormalization = conversions['boolean'](options.disableNormalization, {
        context: `Failed to construct 'ConvolverNode': Failed to read the 'disableNormalization' property from ConvolverOptions: The provided value (${options.disableNormalization}})`,
      });
    } else {
      parsedOptions.disableNormalization = false;
    }

    if (options && options.channelCount !== undefined) {
      parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
        enforceRange: true,
        context: `Failed to construct 'ConvolverNode': Failed to read the 'channelCount' property from ConvolverOptions: The provided value '${options.channelCount}'`,
      });
    }

    if (options && options.channelCountMode !== undefined) {
      parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
        context: `Failed to construct 'ConvolverNode': Failed to read the 'channelCount' property from ConvolverOptions: The provided value '${options.channelCountMode}'`,
      });
    }

    if (options && options.channelInterpretation !== undefined) {
      parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
        context: `Failed to construct 'ConvolverNode': Failed to read the 'channelInterpretation' property from ConvolverOptions: The provided value '${options.channelInterpretation}'`,
      });
    }

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiConvolverNode(context[kNapiObj], parsedOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super(context, {
      [kNapiObj]: napiObj,
    });

    // keep the wrapped AudioBuffer around
    Object.defineProperty(this, kAudioBuffer, {
      __proto__: null,
      enumerable: false,
      writable: true,
      value: null,
    });

    if (options && options.buffer !== undefined) {
      this[kAudioBuffer] = options.buffer;
    }

  }

  get buffer() {
    if (!(this instanceof ConvolverNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConvolverNode\'');
    }

    return this[kAudioBuffer];
  }

  set buffer(value) {
    if (!(this instanceof ConvolverNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConvolverNode\'');
    }

    if (value === null) {
      console.warn('Setting the \'buffer\' property on \'ConvolverNode\' to \'null\' is not supported yet');
      return;
    } else if (!(value instanceof AudioBuffer)) {
      throw new TypeError('Failed to set the \'buffer\' property on \'ConvolverNode\': Failed to convert value to \'AudioBuffer\'');
    }

    try {
      this[kNapiObj].buffer = value[kNapiObj];
    } catch (err) {
      throwSanitizedError(err);
    }

    this[kAudioBuffer] = value;
  }

  get normalize() {
    if (!(this instanceof ConvolverNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConvolverNode\'');
    }

    return this[kNapiObj].normalize;
  }

  set normalize(value) {
    if (!(this instanceof ConvolverNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConvolverNode\'');
    }

    value = conversions['boolean'](value, {
      context: `Failed to set the 'normalize' property on 'ConvolverNode': Value`,
    });

    try {
      this[kNapiObj].normalize = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

}

Object.defineProperties(ConvolverNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 1,
  },
});

Object.defineProperties(ConvolverNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'ConvolverNode',
  },

  buffer: kEnumerableProperty,
  normalize: kEnumerableProperty,

});
