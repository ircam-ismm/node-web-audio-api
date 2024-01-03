const EventTargetMixin = require('./EventTarget.mixin.js');
const { throwSanitizedError } = require('./lib/errors.js');

module.exports = function(NativeAudioBufferSourceNode) {
  class AudioBufferSourceNode extends EventTargetMixin(NativeAudioBufferSourceNode, ['ended']) {
    constructor(audioContext, options) {
      super(audioContext, options);
      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();
    }

    // setters can fail too, e.g.
    // src.buffer = 'test';

    start(...args) {
      try {
        super.start(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
  }

  return AudioBufferSourceNode;
};
