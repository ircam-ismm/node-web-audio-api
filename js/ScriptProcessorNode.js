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
      const parsedOptions = {

      };

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'ScriptProcessorNode\': argument 2 is not of type \'GainOptions\'');
      }

      // @todo
      // createScriptProcessor(bufferSize = 256, numberOfInputChannels = 2, numberOfOutputChannels = 2)
      // all unsigned long, all optional
      parsedOptions.bufferSize = 256;
      parsedOptions.numberOfInputChannels = 1;
      // @note - this crashes when set to 2
      parsedOptions.numberOfOutputChannels = 1;
      //
      // if (options && options.gain !== undefined) {
      //   parsedOptions.gain = conversions['float'](options.gain, {
      //     context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'gain' property from GainOptions: The provided value (${options.gain}})`,
      //   });
      // } else {
      //   parsedOptions.gain = 1.0;
      // }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'channelCount' property from GainOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'channelCount' property from GainOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'ScriptProcessorNode': Failed to read the 'channelInterpretation' property from GainOptions: The provided value '${options.channelInterpretation}'`,
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

      bridgeEventTarget(this);
    }

    get bufferSize() {
      if (!(this instanceof ScriptProcessorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'ScriptProcessorNode\'');
      }

      return this[kNapiObj].bufferSize;
    }

    get onaudioprocess() {
      if (!(this instanceof AudioScheduledSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
      }

      return this.#onaudioprocess;
    }

    set onaudioprocess(value) {
      if (!(this instanceof AudioScheduledSourceNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioScheduledSourceNode\'');
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
      value: 1,
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
    gain: kEnumerableProperty,

  });

  return ScriptProcessorNode;
};
