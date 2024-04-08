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

const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kNapiObj,
  kNativeAudioParam,
} = require('./lib/symbols.js');
const {
  kEnumerableProperty,
} = require('./lib/utils.js');

const AudioParam = require('./AudioParam.js');

class AudioNode extends EventTarget {
  #context = null;

  constructor(context, napiObj) {
    super(napiObj);

    this.#context = context;
    this[kNapiObj] = napiObj;
  }

  get context() {
    return this.#context;
  }

  get numberOfInputs() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    return this[kNapiObj].numberOfInputs;
  }

  get numberOfOutputs() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    return this[kNapiObj].numberOfOutputs;
  }

  get channelCount() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    return this[kNapiObj].channelCount;
  }

  get channelCountMode() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    return this[kNapiObj].channelCountMode;
  }

  get channelInterpretation() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    return this[kNapiObj].channelInterpretation;
  }

  set channelCount(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    try {
      this[kNapiObj].channelCount = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  set channelCountMode(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    try {
      this[kNapiObj].channelCountMode = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  set channelInterpretation(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    try {
      this[kNapiObj].channelInterpretation = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  // ------------------------------------------------------
  // connect / disconnect
  // ------------------------------------------------------

  // @todo
  // AudioNode connect (AudioNode destinationNode,
  //                    optional unsigned long output = 0,
  //                    optional unsigned long input = 0);
  // undefined connect (AudioParam destinationParam, optional unsigned long output = 0);

  connect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    if (arguments.length < 1) {
      throw new TypeError(`Failed to execute 'connect' on 'AudioNode': 1 argument required, but only ${arguments.length} present`);
    }

    const jsDest = args[0];

    // note that audio listener params are not wrapped
    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    if (args[0] instanceof AudioNode) {
      args[0] = args[0][kNapiObj];
    }

    try {
      this[kNapiObj].connect(...args);
      return jsDest;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  // @todo
  // undefined disconnect ();
  // undefined disconnect (unsigned long output);
  // undefined disconnect (AudioNode destinationNode);
  // undefined disconnect (AudioNode destinationNode, unsigned long output);
  // undefined disconnect (AudioNode destinationNode,
  //                       unsigned long output,
  //                       unsigned long input);
  // undefined disconnect (AudioParam destinationParam);
  // undefined disconnect (AudioParam destinationParam, unsigned long output);

  disconnect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    if (args[0] instanceof AudioNode) {
      args[0] = args[0][kNapiObj];
    }

    try {
      this[kNapiObj].disconnect(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
}

Object.defineProperties(AudioNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioNode',
  },

  context: kEnumerableProperty,
  numberOfInputs: kEnumerableProperty,
  numberOfOutputs: kEnumerableProperty,
  channelCount: kEnumerableProperty,
  channelCountMode: kEnumerableProperty,
  channelInterpretation: kEnumerableProperty,

  connect: kEnumerableProperty,
  disconnect: kEnumerableProperty,
});

module.exports = AudioNode;
