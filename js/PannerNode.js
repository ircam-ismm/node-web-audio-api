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
const {
  kNapiObj,
  kAudioBuffer,
} = require('./lib/symbols.js');
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
      const parsedOptions = {};

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'PannerNode\': argument 2 is not of type \'PannerOptions\'');
      }

      if (options && options.panningModel !== undefined) {
        if (!['equalpower', 'HRTF'].includes(options.panningModel)) {
          throw new TypeError(`Failed to construct 'PannerNode': Failed to read the 'panningModel' property from PannerOptions: The provided value '${options.panningModel}' is not a valid enum value of type PanningModelType`);
        }

        parsedOptions.panningModel = conversions['DOMString'](options.panningModel, {
          context: `Failed to construct 'PannerNode': Failed to read the 'panningModel' property from PannerOptions: The provided value '${options.panningModel}'`,
        });
      } else {
        parsedOptions.panningModel = 'equalpower';
      }

      if (options && options.distanceModel !== undefined) {
        if (!['linear', 'inverse', 'exponential'].includes(options.distanceModel)) {
          throw new TypeError(`Failed to construct 'PannerNode': Failed to read the 'distanceModel' property from PannerOptions: The provided value '${options.distanceModel}' is not a valid enum value of type DistanceModelType`);
        }

        parsedOptions.distanceModel = conversions['DOMString'](options.distanceModel, {
          context: `Failed to construct 'PannerNode': Failed to read the 'distanceModel' property from PannerOptions: The provided value '${options.distanceModel}'`,
        });
      } else {
        parsedOptions.distanceModel = 'inverse';
      }

      if (options && options.positionX !== undefined) {
        parsedOptions.positionX = conversions['float'](options.positionX, {
          context: `Failed to construct 'PannerNode': Failed to read the 'positionX' property from PannerOptions: The provided value (${options.positionX}})`,
        });
      } else {
        parsedOptions.positionX = 0;
      }

      if (options && options.positionY !== undefined) {
        parsedOptions.positionY = conversions['float'](options.positionY, {
          context: `Failed to construct 'PannerNode': Failed to read the 'positionY' property from PannerOptions: The provided value (${options.positionY}})`,
        });
      } else {
        parsedOptions.positionY = 0;
      }

      if (options && options.positionZ !== undefined) {
        parsedOptions.positionZ = conversions['float'](options.positionZ, {
          context: `Failed to construct 'PannerNode': Failed to read the 'positionZ' property from PannerOptions: The provided value (${options.positionZ}})`,
        });
      } else {
        parsedOptions.positionZ = 0;
      }

      if (options && options.orientationX !== undefined) {
        parsedOptions.orientationX = conversions['float'](options.orientationX, {
          context: `Failed to construct 'PannerNode': Failed to read the 'orientationX' property from PannerOptions: The provided value (${options.orientationX}})`,
        });
      } else {
        parsedOptions.orientationX = 1;
      }

      if (options && options.orientationY !== undefined) {
        parsedOptions.orientationY = conversions['float'](options.orientationY, {
          context: `Failed to construct 'PannerNode': Failed to read the 'orientationY' property from PannerOptions: The provided value (${options.orientationY}})`,
        });
      } else {
        parsedOptions.orientationY = 0;
      }

      if (options && options.orientationZ !== undefined) {
        parsedOptions.orientationZ = conversions['float'](options.orientationZ, {
          context: `Failed to construct 'PannerNode': Failed to read the 'orientationZ' property from PannerOptions: The provided value (${options.orientationZ}})`,
        });
      } else {
        parsedOptions.orientationZ = 0;
      }

      if (options && options.refDistance !== undefined) {
        parsedOptions.refDistance = conversions['double'](options.refDistance, {
          context: `Failed to construct 'PannerNode': Failed to read the 'refDistance' property from PannerOptions: The provided value (${options.refDistance}})`,
        });
      } else {
        parsedOptions.refDistance = 1;
      }

      if (options && options.maxDistance !== undefined) {
        parsedOptions.maxDistance = conversions['double'](options.maxDistance, {
          context: `Failed to construct 'PannerNode': Failed to read the 'maxDistance' property from PannerOptions: The provided value (${options.maxDistance}})`,
        });
      } else {
        parsedOptions.maxDistance = 10000;
      }

      if (options && options.rolloffFactor !== undefined) {
        parsedOptions.rolloffFactor = conversions['double'](options.rolloffFactor, {
          context: `Failed to construct 'PannerNode': Failed to read the 'rolloffFactor' property from PannerOptions: The provided value (${options.rolloffFactor}})`,
        });
      } else {
        parsedOptions.rolloffFactor = 1;
      }

      if (options && options.coneInnerAngle !== undefined) {
        parsedOptions.coneInnerAngle = conversions['double'](options.coneInnerAngle, {
          context: `Failed to construct 'PannerNode': Failed to read the 'coneInnerAngle' property from PannerOptions: The provided value (${options.coneInnerAngle}})`,
        });
      } else {
        parsedOptions.coneInnerAngle = 360;
      }

      if (options && options.coneOuterAngle !== undefined) {
        parsedOptions.coneOuterAngle = conversions['double'](options.coneOuterAngle, {
          context: `Failed to construct 'PannerNode': Failed to read the 'coneOuterAngle' property from PannerOptions: The provided value (${options.coneOuterAngle}})`,
        });
      } else {
        parsedOptions.coneOuterAngle = 360;
      }

      if (options && options.coneOuterGain !== undefined) {
        parsedOptions.coneOuterGain = conversions['double'](options.coneOuterGain, {
          context: `Failed to construct 'PannerNode': Failed to read the 'coneOuterGain' property from PannerOptions: The provided value (${options.coneOuterGain}})`,
        });
      } else {
        parsedOptions.coneOuterGain = 0;
      }

      if (options && options.channelCount !== undefined) {
        parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
          enforceRange: true,
          context: `Failed to construct 'PannerNode': Failed to read the 'channelCount' property from PannerOptions: The provided value '${options.channelCount}'`,
        });
      }

      if (options && options.channelCountMode !== undefined) {
        parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
          context: `Failed to construct 'PannerNode': Failed to read the 'channelCount' property from PannerOptions: The provided value '${options.channelCountMode}'`,
        });
      }

      if (options && options.channelInterpretation !== undefined) {
        parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
          context: `Failed to construct 'PannerNode': Failed to read the 'channelInterpretation' property from PannerOptions: The provided value '${options.channelInterpretation}'`,
        });
      }

      let napiObj;

      try {
        napiObj = new nativeBinding.PannerNode(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, {
        [kNapiObj]: napiObj,
      });

      this.#positionX = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].positionX,
      });
      this.#positionY = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].positionY,
      });
      this.#positionZ = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].positionZ,
      });
      this.#orientationX = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].orientationX,
      });
      this.#orientationY = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].orientationY,
      });
      this.#orientationZ = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].orientationZ,
      });
    }

    get positionX() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this.#positionX;
    }

    get positionY() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this.#positionY;
    }

    get positionZ() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this.#positionZ;
    }

    get orientationX() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this.#orientationX;
    }

    get orientationY() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this.#orientationY;
    }

    get orientationZ() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this.#orientationZ;
    }

    get panningModel() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].panningModel;
    }

    set panningModel(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      if (!['equalpower', 'HRTF'].includes(value)) {
        console.warn(`Failed to set the 'panningModel' property on 'PannerNode': Value '${value}' is not a valid 'PanningModelType' enum value`);
        return;
      }

      try {
        this[kNapiObj].panningModel = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get distanceModel() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].distanceModel;
    }

    set distanceModel(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      if (!['linear', 'inverse', 'exponential'].includes(value)) {
        console.warn(`Failed to set the 'distanceModel' property on 'PannerNode': Value '${value}' is not a valid 'DistanceModelType' enum value`);
        return;
      }

      try {
        this[kNapiObj].distanceModel = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get refDistance() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].refDistance;
    }

    set refDistance(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'refDistance' property on 'PannerNode': Value`,
      });

      try {
        this[kNapiObj].refDistance = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get maxDistance() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].maxDistance;
    }

    set maxDistance(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'maxDistance' property on 'PannerNode': Value`,
      });

      try {
        this[kNapiObj].maxDistance = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get rolloffFactor() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].rolloffFactor;
    }

    set rolloffFactor(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'rolloffFactor' property on 'PannerNode': Value`,
      });

      try {
        this[kNapiObj].rolloffFactor = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get coneInnerAngle() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].coneInnerAngle;
    }

    set coneInnerAngle(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'coneInnerAngle' property on 'PannerNode': Value`,
      });

      try {
        this[kNapiObj].coneInnerAngle = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get coneOuterAngle() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].coneOuterAngle;
    }

    set coneOuterAngle(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'coneOuterAngle' property on 'PannerNode': Value`,
      });

      try {
        this[kNapiObj].coneOuterAngle = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    get coneOuterGain() {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      return this[kNapiObj].coneOuterGain;
    }

    set coneOuterGain(value) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      value = conversions['double'](value, {
        context: `Failed to set the 'coneOuterGain' property on 'PannerNode': Value`,
      });

      try {
        this[kNapiObj].coneOuterGain = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setPosition(x, y, z) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      if (arguments.length < 3) {
        throw new TypeError(`Failed to execute 'setPosition' on 'PannerNode': 3 argument required, but only ${arguments.length} present`);
      }

      x = conversions['float'](x, {
        context: `Failed to execute 'setPosition' on 'PannerNode': Parameter 1`,
      });

      y = conversions['float'](y, {
        context: `Failed to execute 'setPosition' on 'PannerNode': Parameter 2`,
      });

      z = conversions['float'](z, {
        context: `Failed to execute 'setPosition' on 'PannerNode': Parameter 3`,
      });

      try {
        return this[kNapiObj].setPosition(x, y, z);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setOrientation(x, y, z) {
      if (!(this instanceof PannerNode)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'PannerNode\'');
      }

      if (arguments.length < 3) {
        throw new TypeError(`Failed to execute 'setOrientation' on 'PannerNode': 3 argument required, but only ${arguments.length} present`);
      }

      x = conversions['float'](x, {
        context: `Failed to execute 'setOrientation' on 'PannerNode': Parameter 1`,
      });

      y = conversions['float'](y, {
        context: `Failed to execute 'setOrientation' on 'PannerNode': Parameter 2`,
      });

      z = conversions['float'](z, {
        context: `Failed to execute 'setOrientation' on 'PannerNode': Parameter 3`,
      });

      try {
        return this[kNapiObj].setOrientation(x, y, z);
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

  return PannerNode;
};
