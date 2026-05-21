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
  AudioContext,
} from './AudioContext.js';

/* eslint-enable no-unused-vars */

import {
  AudioNode,
} from './AudioNode.js';

export class MediaStreamAudioSourceNode extends AudioNode {

  constructor(context, options) {

    if (arguments.length < 2) {
      throw new TypeError(`Failed to construct 'MediaStreamAudioSourceNode': 2 argument required, but only ${arguments.length} present`);
    }

    if (!(context instanceof AudioContext)) {
      throw new TypeError(`Failed to construct 'MediaStreamAudioSourceNode': argument 1 is not of type AudioContext`);
    }

    const parsedOptions = {};

    if (options && typeof options !== 'object') {
      throw new TypeError('Failed to construct \'MediaStreamAudioSourceNode\': argument 2 is not of type \'MediaStreamAudioSourceOptions\'');
    }

    // required options
    if (typeof options !== 'object' || (options && options.mediaStream === undefined)) {
      throw new TypeError('Failed to construct \'MediaStreamAudioSourceNode\': Failed to read the \'mediaStream\' property from MediaStreamAudioSourceOptions: Required member is undefined');
    }

    parsedOptions.mediaStream = options.mediaStream;

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiMediaStreamAudioSourceNode(context[kNapiObj], parsedOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super(context, {
      [kNapiObj]: napiObj,
    });

  }

  get mediaStream() {
    if (!(this instanceof MediaStreamAudioSourceNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'MediaStreamAudioSourceNode\'');
    }

    return this[kNapiObj].mediaStream;
  }

}

Object.defineProperties(MediaStreamAudioSourceNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 2,
  },
});

Object.defineProperties(MediaStreamAudioSourceNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'MediaStreamAudioSourceNode',
  },

  mediaStream: kEnumerableProperty,

});
