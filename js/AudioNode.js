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

const conversions = require('webidl-conversions');

const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kEnumerableProperty,
  kHiddenProperty,
} = require('./lib/utils.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');

const AudioParam = require('./AudioParam.js');

class AudioNode extends EventTarget {
  #context = null;

  constructor(context, options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object') ||
      !(kNapiObj in options)
    ) {
      throw new TypeError('Illegal constructor');
    }

    super(options[kNapiObj]);

    this.#context = context;

    Object.defineProperty(this, kNapiObj, {
      value: options[kNapiObj],
      ...kHiddenProperty,
    });
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

  set channelCount(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    value = conversions['unsigned long'](value, {
      context: `Failed to set the 'channelCount' property on 'AudioNode': Value`,
    });

    try {
      this[kNapiObj].channelCount = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  get channelCountMode() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    return this[kNapiObj].channelCountMode;
  }

  set channelCountMode(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    if (!['max', 'clamped-max', 'explicit'].includes(value)) {
      console.warn(`Failed to set the 'channelCountMode' property on 'AudioNode': Value '${value}' is not a valid 'ChannelCountMode' enum value`);
      return;
    }

    try {
      this[kNapiObj].channelCountMode = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  get channelInterpretation() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    return this[kNapiObj].channelInterpretation;
  }

  set channelInterpretation(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    if (!['speakers', 'discrete'].includes(value)) {
      console.warn(`Failed to set the 'channelInterpretation' property on 'AudioNode': Value '${value}' is not a valid 'ChannelInterpretation' enum value`);
      return;
    }

    try {
      this[kNapiObj].channelInterpretation = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  connect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    if (arguments.length < 1) {
      throw new TypeError(`Failed to execute 'connect' on 'AudioNode': 1 argument required, but only ${arguments.length} present`);
    }

    let destination;
    let output;
    let input;

    // note that audio listener params are not wrapped
    if (args[0] instanceof AudioNode) {
      destination = args[0][kNapiObj];

      if (args[1] !== undefined) {
        output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: 'Failed to execute \'connect\' on \'AudioNode\':',
        });
      } else {
        output = 0;
      }

      if (args[2] !== undefined) {
        input = conversions['unsigned long'](args[2], {
          enforceRange: true,
          context: 'Failed to execute \'connect\' on \'AudioNode\':',
        });
      } else {
        input = 0;
      }
    } else if (args[0] instanceof AudioParam) {
      if (arguments.length > 2) {
        throw new TypeError('Failed to execute \'connect\' on \'AudioNode\': parameter 1 is not of type \'AudioNode\'');
      }

      destination = args[0][kNapiObj];

      if (args[1] !== undefined) {
        output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: 'Failed to execute \'connect\' on \'AudioNode\':',
        });
      } else {
        output = 0;
      }

      // Rust does not make difference between AudioNode and AudioParam
      input = 0;
    } else {
      throw new TypeError('Failed to execute \'connect\' on \'AudioNode\': Overload resolution failed');
    }

    try {
      this[kNapiObj].connect(destination, output, input);
    } catch (err) {
      throwSanitizedError(err);
    }

    // return given destination
    return args[0];
  }

  disconnect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioNode\'');
    }

    if (arguments.length > 2) {
      if (args[0] instanceof AudioNode) {
        const destination = args[0][kNapiObj];
        const output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: 'Failed to execute \'connect\' on \'AudioNode\':',
        });
        const input = conversions['unsigned long'](args[2], {
          enforceRange: true,
          context: 'Failed to execute \'connect\' on \'AudioNode\':',
        });

        try {
          return this[kNapiObj].disconnect(destination, output, input);
        } catch (err) {
          throwSanitizedError(err);
        }
      } else {
        throw new TypeError('Failed to execute \'disconnect\' on \'AudioNode\': : Overload resolution failed');
      }
    } else if (arguments.length === 2) {
      if (args[0] instanceof AudioNode || args[0] instanceof AudioParam) {
        const destination = args[0][kNapiObj];
        const output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: 'Failed to execute \'connect\' on \'AudioNode\':',
        });

        try {
          return this[kNapiObj].disconnect(destination, output);
        } catch (err) {
          throwSanitizedError(err);
        }
      } else {
        throw new TypeError('Failed to execute \'disconnect\' on \'AudioNode\': : Overload resolution failed');
      }
    } else if (arguments.length === 1) {
      if (args[0] instanceof AudioNode || args[0] instanceof AudioParam) {
        const destination = args[0][kNapiObj];

        try {
          return this[kNapiObj].disconnect(destination);
        } catch (err) {
          throwSanitizedError(err);
        }
      } else if (Number.isFinite(args[0])) {
        const output = conversions['unsigned long'](args[0], {
          enforceRange: true,
          context: 'Failed to execute \'connect\' on \'AudioNode\':',
        });

        try {
          return this[kNapiObj].disconnect(output);
        } catch (err) {
          throwSanitizedError(err);
        }
      }

      // Note that we don't have the "overload resolution failed" branch here
      // which seems to be aligned with browsers behavior
    }

    // Just call disconnect for remaning cases
    // - i.e. including node.disconnect(NaN), node.disconnect(null), etc.
    try {
      this[kNapiObj].disconnect();
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
