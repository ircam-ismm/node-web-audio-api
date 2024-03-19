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
        throw new TypeError(`Failed to construct 'PannerNode': 1 argument required, but only ${arguments.length} present.`);
      }

      if (!(context instanceof nativeBinding.AudioContext) && !(context instanceof nativeBinding.OfflineAudioContext)) {
        throw new TypeError(`Failed to construct 'PannerNode': argument 1 is not of type BaseAudioContext`);
      }

      // keep a handle to the original object, if we need to manipulate the
      // options before passing them to NAPI
      const parsedOptions = Object.assign({}, options);

      if (options && typeof options !== 'object') {
        throw new TypeError('Failed to construct \'PannerNode\': argument 2 is not of type \'PannerOptions\'');
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
