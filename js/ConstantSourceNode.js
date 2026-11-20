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
  AudioScheduledSourceNode,
} from './AudioScheduledSourceNode.js';

export class ConstantSourceNode extends AudioScheduledSourceNode {

  #offset = null;

  constructor(context, options) {

    if (arguments.length < 1) {
      throw new TypeError(`Failed to construct 'ConstantSourceNode': 1 argument required, but only ${arguments.length} present`);
    }

    if (!(context instanceof BaseAudioContext)) {
      throw new TypeError(`Failed to construct 'ConstantSourceNode': argument 1 is not of type BaseAudioContext`);
    }

    const parsedOptions = {};

    if (options && typeof options !== 'object') {
      throw new TypeError('Failed to construct \'ConstantSourceNode\': argument 2 is not of type \'ConstantSourceOptions\'');
    }

    if (options && options.offset !== undefined) {
      parsedOptions.offset = conversions['float'](options.offset, {
        context: `Failed to construct 'ConstantSourceNode': Failed to read the 'offset' property from ConstantSourceOptions: The provided value (${options.offset}})`,
      });
    } else {
      parsedOptions.offset = 1;
    }

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiConstantSourceNode(context[kNapiObj], parsedOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super(context, {
      [kNapiObj]: napiObj,
    });

    this.#offset = new AudioParam({
      [kNapiObj]: this[kNapiObj].offset,
    });
  }

  get offset() {
    if (!(this instanceof ConstantSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ConstantSourceNode\'');
    }

    return this.#offset;
  }

  [customInspectSymbol]() {
    return `${this.constructor.name} { offset: ${this.offset} }`;
  }

}

Object.defineProperties(ConstantSourceNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 1,
  },
});

Object.defineProperties(ConstantSourceNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'ConstantSourceNode',
  },
  offset: kEnumerableProperty,

});
