const EventTargetMixin = require('./EventTarget.mixin.js');

module.exports = function(NativeConstantSourceNode) {
  class ConstantSourceNode extends EventTargetMixin(NativeConstantSourceNode, ['ended']) {
    constructor(audioContext, options) {
      super(audioContext, options);
      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();
    }
  }

  return ConstantSourceNode;
}

