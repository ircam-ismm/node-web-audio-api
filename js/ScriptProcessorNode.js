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

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class ScriptProcessorNode extends AudioNode {

    #onaudioprocess = null;

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'ScriptProcessorNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'ScriptProcessorNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'ScriptProcessorNode\': argument 2 is not of type \'ScriptProcessorNodeOptions\'');
      }

      // IDL defines bufferSize default value as 0
      // cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-createscriptprocessor
      // > If it’s not passed in, or if the value is 0, then the implementation
      // > will choose the best buffer size for the given environment, which will
      // > be constant power of 2 throughout the lifetime of the node.
      if (options && options.bufferSize !== undefined && options.bufferSize !== 0) {
        parsedOptions.bufferSize = conversions['unsigned long'](options.bufferSize, {
          enforceRange: true,
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'bufferSize' property from ScriptProcessorNodeOptions: The provided value '${options.bufferSize}'`,
        });
      } else {
        parsedOptions.bufferSize = 256;
      }

      if (options && options.numberOfInputChannels !== undefined) {
        parsedOptions.numberOfInputChannels = conversions['unsigned long'](options.numberOfInputChannels, {
          enforceRange: true,
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'numberOfInputChannels' property from ScriptProcessorNodeOptions: The provided value '${options.numberOfInputChannels}'`,
        });
      } else {
        parsedOptions.numberOfInputChannels = 2;
      }

      if (options && options.numberOfOutputChannels !== undefined) {
        parsedOptions.numberOfOutputChannels = conversions['unsigned long'](options.numberOfOutputChannels, {
          enforceRange: true,
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'numberOfOutputChannels' property from ScriptProcessorNodeOptions: The provided value '${options.numberOfOutputChannels}'`,
        });
      } else {
        parsedOptions.numberOfOutputChannels = 2;
      }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'channelCount' property from ScriptProcessorNodeOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'channelCount' property from ScriptProcessorNodeOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'channelInterpretation' property from ScriptProcessorNodeOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.ScriptProcessorNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      bridgeEventTarget(this, jsExport);
    }

    get bufferSize() {
      if (!(this instanceof ScriptProcessorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ScriptProcessorNode\'');
      }

      return this[kNapiObj].bufferSize;
    }

    get onaudioprocess() {
      if (!(this instanceof ScriptProcessorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ScriptProcessorNode\'');
      }

      return this.#onaudioprocess;
    }

    set onaudioprocess(value) {
      if (!(this instanceof ScriptProcessorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ScriptProcessorNode\'');
      }

      if (isFunction(value) || value === null) {
        this.#onaudioprocess = value;
      }
    }

  }

  Object.defineProperties(ScriptProcessorNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 0,
    },
  });

  Object.defineProperties(ScriptProcessorNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'ScriptProcessorNode',
    },
    bufferSize: kEnumerableProperty,
    onaudioprocess: kEnumerableProperty,

  });

  return ScriptProcessorNode;
};
