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
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  AudioParam,
} = require('./AudioParam.js');
const {
  kNativeAudioBuffer,
  kAudioBuffer,
} = require('./AudioBuffer.js');
/* eslint-enable no-unused-vars */

const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');

module.exports = (NativePannerNode, nativeBinding) => {
  const EventTarget = EventTargetMixin(NativePannerNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);

  class PannerNode extends AudioNode {
    constructor(context, options) {

      if (arguments.length < 1) {
        throw new TypeError(`Failed to construct 'PannerNode': 1 argument required, but only ${arguments.length} present`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
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

      super(context, parsedOptions);

      this.positionX = new AudioParam(this.positionX);
      this.positionY = new AudioParam(this.positionY);
      this.positionZ = new AudioParam(this.positionZ);
      this.orientationX = new AudioParam(this.orientationX);
      this.orientationY = new AudioParam(this.orientationY);
      this.orientationZ = new AudioParam(this.orientationZ);
    }

    get panningModel() {
      return super.panningModel;
    }

    get distanceModel() {
      return super.distanceModel;
    }

    get refDistance() {
      return super.refDistance;
    }

    get maxDistance() {
      return super.maxDistance;
    }

    get rolloffFactor() {
      return super.rolloffFactor;
    }

    get coneInnerAngle() {
      return super.coneInnerAngle;
    }

    get coneOuterAngle() {
      return super.coneOuterAngle;
    }

    get coneOuterGain() {
      return super.coneOuterGain;
    }

    set panningModel(value) {
      try {
        super.panningModel = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set distanceModel(value) {
      try {
        super.distanceModel = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set refDistance(value) {
      try {
        super.refDistance = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set maxDistance(value) {
      try {
        super.maxDistance = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set rolloffFactor(value) {
      try {
        super.rolloffFactor = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set coneInnerAngle(value) {
      try {
        super.coneInnerAngle = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set coneOuterAngle(value) {
      try {
        super.coneOuterAngle = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    set coneOuterGain(value) {
      try {
        super.coneOuterGain = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setPosition(...args) {
      try {
        return super.setPosition(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

    setOrientation(...args) {
      try {
        return super.setOrientation(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return PannerNode;
};
