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

const { throwSanitizedError } = require('./lib/errors.js');

const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');


module.exports = (NativePannerNode) => {

  const EventTarget = EventTargetMixin(NativePannerNode);
  const AudioNode = AudioNodeMixin(EventTarget);

  class PannerNode extends AudioNode {

    // getters

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

    // setters

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

    // methods
    
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
}


  