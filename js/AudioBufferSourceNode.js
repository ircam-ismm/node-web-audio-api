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

module.exports = (NativeAudioBufferSourceNode) => {

  const EventTarget = EventTargetMixin(NativeAudioBufferSourceNode, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);
  const AudioScheduledSourceNode = AudioScheduledSourceNodeMixin(AudioNode);

  class AudioBufferSourceNode extends AudioScheduledSourceNode {
    constructor(context, options) {
      if (options !== undefined && typeof options !== 'object') {
        throw new TypeError("Failed to construct 'AudioBufferSourceNode': argument 2 is not of type 'AudioBufferSourceOptions'")
      }

      super(context, options);
      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();

      this.playbackRate = new AudioParam(this.playbackRate);
      this.detune = new AudioParam(this.detune);
    }

    // getters

    get buffer() {
      if (this[kNativeAudioBuffer]) {
        return this[kNativeAudioBuffer];
      } else {
        return null;
      }
    }
      
    get loop() {
      return super.loop;
    }
      
    get loopStart() {
      return super.loopStart;
    }
      
    get loopEnd() {
      return super.loopEnd;
    }
      
    // setters

    set buffer(value) {
      try {
        super.buffer = value[kNativeAudioBuffer];
      } catch (err) {
        throwSanitizedError(err);
      }

      this[kNativeAudioBuffer] = value;
    }
      
    set loop(value) {
      try {
        super.loop = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
      
    set loopStart(value) {
      try {
        super.loopStart = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
      
    set loopEnd(value) {
      try {
        super.loopEnd = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
      

    // methods

  }

  return AudioBufferSourceNode;
};


  