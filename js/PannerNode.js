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
  kNativeAudioBuffer,
  kAudioBuffer,
} = require('./AudioBuffer.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');
const {
  bridgeEventTarget,
} = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const AudioNode = require('./AudioNode.js');

module.exports = (jsExport, nativeBinding) => {
  class PannerNode extends AudioNode {

    #positionX = null;
    #positionY = null;
    #positionZ = null;
    #orientationX = null;
    #orientationY = null;
    #orientationZ = null;

    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'PannerNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof jsExport.BaseAudioContext)) {
        throw new TypeError(`Failed to construct 'PannerNode': argument 1 is not of type BaseAudioContext`);
      }

      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'PannerNode\': argument 2 is not of type \'PannerOptions\'');
      }

      if (options && 'panningModel' in options) {
        if (!['equalpower', 'HRTF'].includes(options.panningModel)) {
          throw new TypeError(`Failed to construct 'PannerNode': Failed to read the 'panningModel' property from PannerOptions: The provided value '${options.panningModel}' is not a valid enum value of type PanningModelType`);
        }

        parsedOptions.panningModel = options.panningModel;
      } else {
        parsedOptions.panningModel = 'equalpower';
      }

      if (options && 'distanceModel' in options) {
        if (!['linear', 'inverse', 'exponential'].includes(options.distanceModel)) {
          throw new TypeError(`Failed to construct 'PannerNode': Failed to read the 'distanceModel' property from PannerOptions: The provided value '${options.distanceModel}' is not a valid enum value of type DistanceModelType`);
        }

        parsedOptions.distanceModel = options.distanceModel;
      } else {
        parsedOptions.distanceModel = 'inverse';
      }

      if (options && 'positionX' in options) {
        parsedOptions.positionX = conversions['float'](options.positionX, {
          context: `Failed to construct 'PannerNode': Failed to read the 'positionX' property from PannerOptions: The provided value (${options.positionX}})`,
        });
      } else {
        parsedOptions.positionX = 0;
      }

      if (options && 'positionY' in options) {
        parsedOptions.positionY = conversions['float'](options.positionY, {
          context: `Failed to construct 'PannerNode': Failed to read the 'positionY' property from PannerOptions: The provided value (${options.positionY}})`,
        });
      } else {
        parsedOptions.positionY = 0;
      }

      if (options && 'positionZ' in options) {
        parsedOptions.positionZ = conversions['float'](options.positionZ, {
          context: `Failed to construct 'PannerNode': Failed to read the 'positionZ' property from PannerOptions: The provided value (${options.positionZ}})`,
        });
      } else {
        parsedOptions.positionZ = 0;
      }

      if (options && 'orientationX' in options) {
        parsedOptions.orientationX = conversions['float'](options.orientationX, {
          context: `Failed to construct 'PannerNode': Failed to read the 'orientationX' property from PannerOptions: The provided value (${options.orientationX}})`,
        });
      } else {
        parsedOptions.orientationX = 1;
      }

      if (options && 'orientationY' in options) {
        parsedOptions.orientationY = conversions['float'](options.orientationY, {
          context: `Failed to construct 'PannerNode': Failed to read the 'orientationY' property from PannerOptions: The provided value (${options.orientationY}})`,
        });
      } else {
        parsedOptions.orientationY = 0;
      }

      if (options && 'orientationZ' in options) {
        parsedOptions.orientationZ = conversions['float'](options.orientationZ, {
          context: `Failed to construct 'PannerNode': Failed to read the 'orientationZ' property from PannerOptions: The provided value (${options.orientationZ}})`,
        });
      } else {
        parsedOptions.orientationZ = 0;
      }

      if (options && 'refDistance' in options) {
        parsedOptions.refDistance = conversions['double'](options.refDistance, {
          context: `Failed to construct 'PannerNode': Failed to read the 'refDistance' property from PannerOptions: The provided value (${options.refDistance}})`,
        });
      } else {
        parsedOptions.refDistance = 1;
      }

      if (options && 'maxDistance' in options) {
        parsedOptions.maxDistance = conversions['double'](options.maxDistance, {
          context: `Failed to construct 'PannerNode': Failed to read the 'maxDistance' property from PannerOptions: The provided value (${options.maxDistance}})`,
        });
      } else {
        parsedOptions.maxDistance = 10000;
      }

      if (options && 'rolloffFactor' in options) {
        parsedOptions.rolloffFactor = conversions['double'](options.rolloffFactor, {
          context: `Failed to construct 'PannerNode': Failed to read the 'rolloffFactor' property from PannerOptions: The provided value (${options.rolloffFactor}})`,
        });
      } else {
        parsedOptions.rolloffFactor = 1;
      }

      if (options && 'coneInnerAngle' in options) {
        parsedOptions.coneInnerAngle = conversions['double'](options.coneInnerAngle, {
          context: `Failed to construct 'PannerNode': Failed to read the 'coneInnerAngle' property from PannerOptions: The provided value (${options.coneInnerAngle}})`,
        });
      } else {
        parsedOptions.coneInnerAngle = 360;
      }

      if (options && 'coneOuterAngle' in options) {
        parsedOptions.coneOuterAngle = conversions['double'](options.coneOuterAngle, {
          context: `Failed to construct 'PannerNode': Failed to read the 'coneOuterAngle' property from PannerOptions: The provided value (${options.coneOuterAngle}})`,
        });
      } else {
        parsedOptions.coneOuterAngle = 360;
      }

      if (options && 'coneOuterGain' in options) {
        parsedOptions.coneOuterGain = conversions['double'](options.coneOuterGain, {
          context: `Failed to construct 'PannerNode': Failed to read the 'coneOuterGain' property from PannerOptions: The provided value (${options.coneOuterGain}})`,
        });
      } else {
        parsedOptions.coneOuterGain = 0;
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.PannerNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

      this.#positionX = new AudioParam(this[kNapiObj].positionX);
      this.#positionY = new AudioParam(this[kNapiObj].positionY);
      this.#positionZ = new AudioParam(this[kNapiObj].positionZ);
      this.#orientationX = new AudioParam(this[kNapiObj].orientationX);
      this.#orientationY = new AudioParam(this[kNapiObj].orientationY);
      this.#orientationZ = new AudioParam(this[kNapiObj].orientationZ);
    }

    get positionX() {
      return this.#positionX;
    }

    get positionY() {
      return this.#positionY;
    }

    get positionZ() {
      return this.#positionZ;
    }

    get orientationX() {
      return this.#orientationX;
    }

    get orientationY() {
      return this.#orientationY;
    }

    get orientationZ() {
      return this.#orientationZ;
    }

    get panningModel() {
      return this[kNapiObj].panningModel;
    }

    get distanceModel() {
      return this[kNapiObj].distanceModel;
    }

    get refDistance() {
      return this[kNapiObj].refDistance;
    }

    get maxDistance() {
      return this[kNapiObj].maxDistance;
    }

    get rolloffFactor() {
      return this[kNapiObj].rolloffFactor;
    }

    get coneInnerAngle() {
      return this[kNapiObj].coneInnerAngle;
    }

    get coneOuterAngle() {
      return this[kNapiObj].coneOuterAngle;
    }

    get coneOuterGain() {
      return this[kNapiObj].coneOuterGain;
    }

    set panningModel(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].panningModel = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set distanceModel(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].distanceModel = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set refDistance(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].refDistance = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set maxDistance(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].maxDistance = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set rolloffFactor(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].rolloffFactor = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set coneInnerAngle(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].coneInnerAngle = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set coneOuterAngle(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].coneOuterAngle = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set coneOuterGain(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      try {
        this[kNapiObj].coneOuterGain = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setPosition(...args) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      if (arguments.length < 3) {
        throw new TypeError(`Failed to execute 'setPosition' on 'PannerNode': 3 argument required, but only ${arguments.length} present`);
      }

      try {
        return this[kNapiObj].setPosition(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setOrientation(...args) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      if (arguments.length < 3) {
        throw new TypeError(`Failed to execute 'setOrientation' on 'PannerNode': 3 argument required, but only ${arguments.length} present`);
      }

      try {
        return this[kNapiObj].setOrientation(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  Object.defineProperties(PannerNode, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 1,
    },
  });

  Object.defineProperties(PannerNode.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'PannerNode',
    },

    positionX: kEnumerableProperty,
    positionY: kEnumerableProperty,
    positionZ: kEnumerableProperty,
    orientationX: kEnumerableProperty,
    orientationY: kEnumerableProperty,
    orientationZ: kEnumerableProperty,

    panningModel: kEnumerableProperty,
    distanceModel: kEnumerableProperty,
    refDistance: kEnumerableProperty,
    maxDistance: kEnumerableProperty,
    rolloffFactor: kEnumerableProperty,
    coneInnerAngle: kEnumerableProperty,
    coneOuterAngle: kEnumerableProperty,
    coneOuterGain: kEnumerableProperty,

    setPosition: kEnumerableProperty,
    setOrientation: kEnumerableProperty,
  });

  Object.defineProperty(PannerNode.prototype.setPosition, 'length', {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 3,
  });

  Object.defineProperty(PannerNode.prototype.setOrientation, 'length', {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 3,
  });

  return PannerNode;
};
