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


module.exports = (_jsExport, nativeBinding) => {
  class AudioBuffer {
    constructor(options) {
      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'AudioBuffer': 1 argument required, but only ${arguments.length} present`);
      }

      if (typeof options !== 'object') {
        throw new TypeError(`Failed to construct 'AudioBuffer': argument 1 is not of type 'AudioBufferOptions'`);
      }

      if (kNapiObj in options) {
        // internal constructor for `startRendering` and `decodeAudioData` cases
        Object.defineProperty(this, kNapiObj, {
          value: options[kNapiObj],
          ...kHiddenProperty,
        });
      } else {
        // Regular public constructor
        // dictionary AudioBufferOptions {
        //     unsigned long numberOfChannels = 1;
        //     required unsigned long length;
        //     required float sampleRate;
        // };
        const parsedOptions = {};

        if (options.numberOfChannels !== undefined) {
          parsedOptions.numberOfChannels = conversions['unsigned long'](options.numberOfChannels, {
            enforceRange: true,
            context: `Failed to construct 'AudioBuffer': Failed to read the 'numberOfChannels' property from AudioBufferOptions: numberOfCHannels`,
          });
        } else {
          parsedOptions.numberOfChannels = 1;
        }

        if (options.length === undefined) {
          throw new TypeError(`Failed to construct 'AudioBuffer': Failed to read the 'numberOfChannels' property from AudioBufferOptions: required member is undefined`);
        }

        parsedOptions.length = conversions['unsigned long'](options.length, {
          enforceRange: true,
          context: `Failed to construct 'AudioBuffer': Failed to read the 'length' property from AudioBufferOptions: length`,
        });

        if (options.sampleRate === undefined) {
          throw new TypeError(`Failed to construct 'AudioBuffer': Failed to read the 'numberOfChannels' property from AudioBufferOptions: required member is undefined`);
        }

        parsedOptions.sampleRate = conversions['float'](options.sampleRate, {
          context: `Failed to construct 'AudioBuffer': Failed to read the 'sampleRate' property from AudioBufferOptions: sampleRate`,
        });

        let napiObj;

        try {
          napiObj = new nativeBinding.AudioBuffer(parsedOptions);
        } catch (err) {
          throwSanitizedError(err);
        }

        Object.defineProperty(this, kNapiObj, {
          value: napiObj,
          ...kHiddenProperty,
        });
      }
    }

    get sampleRate() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'`);
      }

      return this[kNapiObj].sampleRate;
    }

    get duration() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'`);
      }

      return this[kNapiObj].duration;
    }

    get length() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'`);
      }

      return this[kNapiObj].length;
    }

    get numberOfChannels() {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'`);
      }

      return this[kNapiObj].numberOfChannels;
    }

    copyFromChannel(destination, channelNumber, bufferOffset = 0) {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'`);
      }

      if (arguments.length < 2) {
        throw new TypeError(`Failed to execute 'copyFromChannel' on 'AudioBuffer': 2 argument required, but only ${arguments.length} present`);
      }

      if (!(destination instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyFromChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
      }

      // Rust implementation uses a usize which will clamp -1 to 0, and spec requires
      // an IndexSizeError rather than a TypeError, so this check must be done here.
      // cf. note on AnalyzerNode::fftSize
      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyFromChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      channelNumber = conversions['unsigned long'](channelNumber, {
        context: `Failed to execute 'copyFromChannel' on 'AudioBuffer': channelNumber`,
      });

      bufferOffset = conversions['unsigned long'](bufferOffset, {
        context: `Failed to execute 'copyFromChannel' on 'AudioBuffer': bufferOffset`,
      });

      try {
        this[kNapiObj].copyFromChannel(destination, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    copyToChannel(source, channelNumber, bufferOffset = 0) {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'`);
      }

      if (arguments.length < 2) {
        throw new TypeError(`Failed to execute 'copyToChannel' on 'AudioBuffer': 2 argument required, but only ${arguments.length} present`);
      }

      if (!(source instanceof Float32Array)) {
        throw new TypeError(`Failed to execute 'copyToChannel' on 'AudioBuffer': source is not of type 'Float32Array'`);
      }

      // Rust implementation uses a usize which will clamp -1 to 0, and spec requires
      // an IndexSizeError rather than a TypeError, so this check must be done here.
      // cf. note on AnalyzerNode::fftSize
      if (channelNumber < 0) {
        throw new DOMException(`Failed to execute 'copyToChannel' on 'AudioBuffer': channelNumber must equal or greater than 0`, 'IndexSizeError');
      }

      channelNumber = conversions['unsigned long'](channelNumber, {
        context: `Failed to execute 'copyToChannel' on 'AudioBuffer': channelNumber`,
      });

      bufferOffset = conversions['unsigned long'](bufferOffset, {
        context: `Failed to execute 'copyToChannel' on 'AudioBuffer': bufferOffset`,
      });

      try {
        this[kNapiObj].copyToChannel(source, channelNumber, bufferOffset);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    getChannelData(channel) {
      if (!(this instanceof AudioBuffer)) {
        throw new TypeError(`Invalid Invocation: Value of 'this' must be of type 'AudioBuffer'`);
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'getChannelData' on 'AudioBuffer': 1 argument required, but only ${arguments.length} present`);
      }

      // Rust implementation uses a usize which will clamp -1 to 0, and spec requires
      // an IndexSizeError rather than a TypeError, so this check must be done here.
      // cf. note on AnalyzerNode::fftSize
      if (channel < 0) {
        throw new DOMException(`Failed to execute 'getChannelData' on 'AudioBuffer': channel must equal or greater than 0`, 'IndexSizeError');
      }

      channel = conversions['unsigned long'](channel, {
        context: `Failed to execute 'getChannelData' on 'AudioBuffer': channel`,
      });

      try {
        return this[kNapiObj].getChannelData(channel);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  Object.defineProperties(AudioBuffer, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(AudioBuffer.prototype,  {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AudioBuffer',
    },

    sampleRate: kEnumerableProperty,
    duration: kEnumerableProperty,
    length: kEnumerableProperty,
    numberOfChannels: kEnumerableProperty,
    copyFromChannel: kEnumerableProperty,
    copyToChannel: kEnumerableProperty,
    getChannelData: kEnumerableProperty,
  });

  return AudioBuffer;
};


