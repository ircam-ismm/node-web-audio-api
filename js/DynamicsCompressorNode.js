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

const AudioParam = require('./AudioParam.js');
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
  class DynamicsCompressorNode extends AudioNode {

    #threshold = null;
    #knee = null;
    #ratio = null;
    #attack = null;
    #release = null;

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'DynamicsCompressorNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'DynamicsCompressorNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'DynamicsCompressorNode\': argument 2 is not of type \'DynamicsCompressorOptions\'');
      }

      if (options && options.attack !== undefined) {
        parsedOptions.attack = conversions['float'](options.attack, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'attack' property from DynamicsCompressorOptions: The provided value (${options.attack}})`,
        });
      } else {
        parsedOptions.attack = 0.003;
      }

      if (options && options.knee !== undefined) {
        parsedOptions.knee = conversions['float'](options.knee, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'knee' property from DynamicsCompressorOptions: The provided value (${options.knee}})`,
        });
      } else {
        parsedOptions.knee = 30;
      }

      if (options && options.ratio !== undefined) {
        parsedOptions.ratio = conversions['float'](options.ratio, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'ratio' property from DynamicsCompressorOptions: The provided value (${options.ratio}})`,
        });
      } else {
        parsedOptions.ratio = 12;
      }

      if (options && options.release !== undefined) {
        parsedOptions.release = conversions['float'](options.release, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'release' property from DynamicsCompressorOptions: The provided value (${options.release}})`,
        });
      } else {
        parsedOptions.release = 0.25;
      }

      if (options && options.threshold !== undefined) {
        parsedOptions.threshold = conversions['float'](options.threshold, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'threshold' property from DynamicsCompressorOptions: The provided value (${options.threshold}})`,
        });
      } else {
        parsedOptions.threshold = -24;
      }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'channelCount' property from DynamicsCompressorOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'channelCount' property from DynamicsCompressorOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'DynamicsCompressorNode': Failed to read the 'channelInterpretation' property from DynamicsCompressorOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.DynamicsCompressorNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

      this.#threshold = new AudioParam(this[kNapiObj].threshold);
      this.#knee = new AudioParam(this[kNapiObj].knee);
      this.#ratio = new AudioParam(this[kNapiObj].ratio);
      this.#attack = new AudioParam(this[kNapiObj].attack);
      this.#release = new AudioParam(this[kNapiObj].release);
    }

    get threshold() {
      if (!(this instanceof DynamicsCompressorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'DynamicsCompressorNode\'');
      }

      return this.#threshold;
    }

    get knee() {
      if (!(this instanceof DynamicsCompressorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'DynamicsCompressorNode\'');
      }

      return this.#knee;
    }

    get ratio() {
      if (!(this instanceof DynamicsCompressorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'DynamicsCompressorNode\'');
      }

      return this.#ratio;
    }

    get attack() {
      if (!(this instanceof DynamicsCompressorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'DynamicsCompressorNode\'');
      }

      return this.#attack;
    }

    get release() {
      if (!(this instanceof DynamicsCompressorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'DynamicsCompressorNode\'');
      }

      return this.#release;
    }

    get reduction() {
      if (!(this instanceof DynamicsCompressorNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'DynamicsCompressorNode\'');
      }

      return this[kNapiObj].reduction;
    }

  }

  Object.defineProperties(DynamicsCompressorNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(DynamicsCompressorNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'DynamicsCompressorNode',
    },
    threshold: kEnumerableProperty,
    knee: kEnumerableProperty,
    ratio: kEnumerableProperty,
    attack: kEnumerableProperty,
    release: kEnumerableProperty,
    reduction: kEnumerableProperty,

  });

  return DynamicsCompressorNode;
};
