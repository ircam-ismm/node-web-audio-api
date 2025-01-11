const conversions = require('webidl-conversions');
const {
  toSanitizedSequence,
} = require('./lib/cast.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kNapiObj,
  kProcessorRegistered,
  kGetParameterDescriptors,
  kPrivateConstructor,
  kCreateProcessor,
} = require('./lib/symbols.js');
const {
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  propagateEvent,
} = require('./lib/events.js');
const {
  ErrorEvent,
} = require('./Events.js');

const AudioNode = require('./AudioNode.js');
const AudioParamMap = require('./AudioParamMap.js');
const IMPLEMENTATION_MAX_NUMBER_OF_CHANNELS = 32;

module.exports = (jsExport, nativeBinding) => {
  class AudioWorkletNode extends AudioNode {
    #port = null;
    #parameters = {};

    constructor(context, name, options) {
      if (arguments.length < 2) {
        throw new TypeError(`Failed to construct 'AudioWorkletNode': 2 arguments required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'AudioWorkletNode': argument 1 is not of type BaseAudioContext`);
      }

      const parsedName = conversions['DOMString'](name, {
        context: `Failed to construct 'AudioWorkletNode': The given 'AudioWorkletProcessor' name`,
      });

      if (!context.audioWorklet[kProcessorRegistered](parsedName)) {
        throw new DOMException(`Failed to construct 'AudioWorkletNode': processor '${parsedName}' is not registered in 'AudioWorklet'`, 'InvalidStateError');
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && (typeof options !== 'object' || options === null)) {
        throw new TypeError('Failed to construct \'AudioWorkletNode\': argument 3 is not of type \'AudioWorkletNodeOptions\'');
      }

      if (options && options.numberOfInputs !== undefined) {
        parsedOptions.numberOfInputs = conversions['unsigned long'](options.numberOfInputs, {
          enforceRange: true,
          context: `Failed to construct 'AudioWorkletNode': Failed to read the 'numberOfInputs' property from AudioWorkletNodeOptions: The provided value (${options.numberOfInputs}})`,
        });
      } else {
        parsedOptions.numberOfInputs = 1;
      }

      if (options && options.numberOfOutputs !== undefined) {
        parsedOptions.numberOfOutputs = conversions['unsigned long'](options.numberOfOutputs, {
          enforceRange: true,
          context: `Failed to construct 'AudioWorkletNode': Failed to read the 'numberOfOutputs' property from AudioWorkletNodeOptions: The provided value (${options.numberOfOutputs}})`,
        });
      } else {
        parsedOptions.numberOfOutputs = 1;
      }

      // If outputChannelCount exists,
      // - If any value in outputChannelCount is zero or greater than the implementation’s maximum number of channels, throw a NotSupportedError and abort the remaining steps.
      // - If the length of outputChannelCount does not equal numberOfOutputs, throw an IndexSizeError and abort the remaining steps.
      // - If both numberOfInputs and numberOfOutputs are 1, set the channel count of the node output to the one value in outputChannelCount.
      // - Otherwise set the channel count of the kth output of the node to the kth element of outputChannelCount sequence and return.
      if (options && options.outputChannelCount !== undefined) {
        try {
          parsedOptions.outputChannelCount = toSanitizedSequence(options.outputChannelCount, Uint32Array);
        } catch (err) {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Failed to read the 'outputChannelCount' property from AudioWorkletNodeOptions: The provided value ${err.message}`);
        }

        parsedOptions.outputChannelCount.forEach((value, index) => {
          if (value <= 0 || value > IMPLEMENTATION_MAX_NUMBER_OF_CHANNELS) {
            throw new DOMException(`Failed to construct 'AudioWorkletNode': Invalid 'outputChannelCount' property from AudioWorkletNodeOptions: Value at index ${index} in outside supported range [1, 32]`, 'NotSupportedError');
          }
        });

        if (parsedOptions.numberOfOutputs !== parsedOptions.outputChannelCount.length) {
          throw new DOMException(`Failed to construct 'AudioWorkletNode': Invalid 'outputChannelCount' property from AudioWorkletNodeOptions: 'outputChannelCount' length (${parsedOptions.outputChannelCount.length}) does not equal 'numberOfOutputs' (${parsedOptions.numberOfOutputs})`, 'IndexSizeError');
        }
      } else {
        // - If both numberOfInputs and numberOfOutputs are 1, set the initial channel count of the node output to 1 and return.
        //   NOTE: For this case, the output chanel count will change to computedNumberOfChannels dynamically based on the input and the channelCountMode at runtime.
        if (parsedOptions.numberOfInputs === 1 && parsedOptions.numberOfOutputs === 1) {
          // rust waits for an empty Vec as the special case value
          parsedOptions.outputChannelCount = new Uint32Array(0);
        } else {
          // - Otherwise set the channel count of each output of the node to 1 and return.
          parsedOptions.outputChannelCount = new Uint32Array(parsedOptions.numberOfOutputs);
          parsedOptions.outputChannelCount.fill(1);
        }
      }

      // @todo
      // - This should be a "record", let's treat it as a raw object of now
      // - Check if this needs to checked against the declared `parameterDescriptors`
      if (options && options.parameterData !== undefined) {
        if (typeof options.parameterData === 'object' && options.parameterData !== null) {
          parsedOptions.parameterData = {};

          for (let [key, value] in Object.entries(options.parameterData)) {
            const parsedKey = conversions['DOMString'](key, {
              context: `Failed to construct 'AudioWorkletNode': Invalid 'parameterData' property from AudioWorkletNodeOptions: Invalid key (${key})`,
            });

            const parsedValue = conversions['double'](value, {
              context: `Failed to construct 'AudioWorkletNode': Invalid 'parameterData' property from AudioWorkletNodeOptions: Invalid value for key ${parsedKey}`,
            });

            parsedOptions.parameterData[parsedKey] = parsedValue;
          }
        } else {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Invalid 'parameterData' property from AudioWorkletNodeOptions: 'outputChannelCount' length (${parsedOptions.outputChannelCount.length}) does not equal 'numberOfOutputs' (${parsedOptions.numberOfOutputs})`);
        }
      } else {
        parsedOptions.parameterData = {};
      }

      // These ones are for the JS processor
      if (options && options.processorOptions !== undefined) {
        if (typeof options.processorOptions === 'object' && options.processorOptions !== null) {
          parsedOptions.processorOptions = Object.assign({}, options.processorOptions);
        } else {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Invalid 'processorOptions' property from AudioWorkletNodeOptions: 'processorOptions' is not an object`);
        }
      } else {
        parsedOptions.processorOptions = {};
      }

      // AudioNodeOptions
      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'AudioWorkletNode': Failed to read the 'channelCount' property from AudioWorkletNodeOptions: The provided value '${options.channelCount}'`,
        });

        // if we delegate this check to Rust, this can poison a Mutex
        // (probably the `audio_param_descriptor_channel` one)
        if (parsedOptions.channelCount <= 0 || parsedOptions.channelCount > IMPLEMENTATION_MAX_NUMBER_OF_CHANNELS) {
          throw new DOMException(`Failed to construct 'AudioWorkletNode': Invalid 'channelCount' property: Number of channels: ${parsedOptions.channelCount} is outside range [1, 32]`, 'NotSupportedError');
        }
      }

      if (options && options.channelCountMode !== undefined) {
        if (!['max', 'clamped-max', 'explicit'].includes(options.channelCountMode)) {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Failed to read the 'channelCountMode' property from 'AudioNodeOptions': The provided value '${options.channelCountMode}' is not a valid enum value of type ChannelCountMode`);
        }

        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'AudioWorkletNode': Failed to read the 'channelCount' property from AudioWorkletNodeOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        if (!['speakers', 'discrete'].includes(options.channelInterpretation)) {
          throw new TypeError(`Failed to construct 'AudioWorkletNode': Failed to read the 'channelInterpretation' property from 'AudioNodeOptions': The provided value '${options.channelInterpretation}' is not a valid enum value of type ChannelCountMode`);
        }

        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'AudioWorkletNode': Failed to read the 'channelInterpretation' property from AudioWorkletNodeOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      // Create NapiAudioWorkletNode
      const parameterDescriptors = context.audioWorklet[kGetParameterDescriptors](parsedName);
      let napiObj;

      try {
        napiObj = new nativeBinding.AudioWorkletNode(
          context[kNapiObj],
          parsedName,
          parsedOptions,
          parameterDescriptors,
        );
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      let parameters = new Map();

      for (let name in this[kNapiObj].parameters) {
        const audioParam = new jsExport.AudioParam({
          [kNapiObj]: this[kNapiObj].parameters[name],
        });

        parameters.set(name, audioParam);
      }

      this.#parameters = new AudioParamMap({
        [kPrivateConstructor]: true,
        parameters,
      });

      // Create JS processor
      this.#port = context.audioWorklet[kCreateProcessor](
        parsedName,
        parsedOptions,
        napiObj.id,
      );

      this.#port.on('message', msg => {
        // Handle 'processorerror' ErrorEvent
        // cf. https://webaudio.github.io/web-audio-api/#dom-audioworkletnode-onprocessorerror
        switch (msg.cmd) {
          case 'node-web-audio-api:worklet:ctor-error': {
            const message = `Failed to construct '${parsedName}' AudioWorkletProcessor: ${msg.err.message}`;
            const event = new ErrorEvent('processorerror', { message, error: msg.err });
            propagateEvent(this, event);
            break;
          }
          case 'node-web-audio-api:worklet:process-invalid': {
            const message = `Failed to execute 'process' on '${parsedName}' AudioWorkletProcessor: ${msg.err.message}`;
            const error = new TypeError(message);
            error.stack = msg.err.stack.replace(msg.err.message, message);

            const event = new ErrorEvent('processorerror', { message, error });
            propagateEvent(this, event);
            break;
          }
          case 'node-web-audio-api:worklet:process-error': {
            const message = `Failed to execute 'process' on '${parsedName}' AudioWorkletProcessor: ${msg.err.message}`;
            const event = new ErrorEvent('processorerror', { message, error: msg.err });
            propagateEvent(this, event);
            break;
          }
        }
      });
    }

    get parameters() {
      if (!(this instanceof AudioWorkletNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletNode\'');
      }

      return this.#parameters;
    }

    get port() {
      if (!(this instanceof AudioWorkletNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioWorkletNode\'');
      }

      return this.#port;
    }
  }

  Object.defineProperties(AudioWorkletNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 2,
    },
  });

  Object.defineProperties(AudioWorkletNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AudioWorkletNode',
    },
    parameters: kEnumerableProperty,
    port: kEnumerableProperty,
  });

  return AudioWorkletNode;
};
