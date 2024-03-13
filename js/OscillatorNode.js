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

// eslint-disable-next-line no-unused-vars
const { throwSanitizedError } = require('./lib/errors.js');
// eslint-disable-next-line no-unused-vars
const { AudioParam } = require('./AudioParam.js');
const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');

const { kNativeAudioBuffer, kAudioBuffer } = require('./AudioBuffer.js');

const AudioScheduledSourceNodeMixin = require('./AudioScheduledSourceNode.mixin.js');

module.exports = (NativeOscillatorNode) => {

  const EventTarget = EventTargetMixin(NativeOscillatorNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);
  const AudioScheduledSourceNode = AudioScheduledSourceNodeMixin(AudioNode);

  class OscillatorNode extends AudioScheduledSourceNode {
    constructor(context, options) {
      if (options !== undefined && typeof options !== 'object') {
        throw new TypeError("Failed to construct 'OscillatorNode': argument 2 is not of type 'OscillatorOptions'")
      }

      super(context, options);
      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();

      this.frequency = new AudioParam(this.frequency);
      this.detune = new AudioParam(this.detune);
    }

    // getters

    get type() {
      return super.type;
    }
      
    // setters

    set type(value) {
      try {
        super.type = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
      

    // methods

    setPeriodicWave(...args) {
      try {
        return super.setPeriodicWave(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }

  }

  return OscillatorNode;
};


  