let contextId = 0;

const kProcessId = Symbol('processId');
const kKeepAwakeId = Symbol('keepAwakeId');

module.exports = function(bindings) {
  const EventTarget = require('./EventTarget.mixin.js')(bindings.AudioContext, ['statechange', 'sinkchange']);
  const BaseAudioContext = require('./BaseAudioContext.mixin.js')(EventTarget, bindings);

  class AudioContext extends BaseAudioContext {
  // class AudioContext extends NativeAudioContext {
    constructor(options = {}) {
      super(options);
      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();

      // prevent garbage collection and process exit
      const id = contextId++;
      // store in process to prevent garbage collection
      const processId = Symbol(`__AudioContext_${id}`);
      process[processId] = this;
      // keep process symbol around to delete later
      this[kProcessId] = processId;
      // keep process awake until context is closed
      const keepAwakeId = setInterval(() => {}, 10 * 1000);
      this[kKeepAwakeId] = keepAwakeId;
    }

    // promisify sync APIs
    resume() {
      return Promise.resolve(super.resume());
    }

    suspend() {
      return Promise.resolve(super.suspend());
    }

    close() {
      // allow to garbage collect the context and to the close the process
      delete process[this[kProcessId]];
      clearTimeout(this[kKeepAwakeId]);

      return Promise.resolve(super.close());
    }

    setSinkId(sinkId) {
      try {
        super.setSinkId(sinkId);
        return Promise.resolve(undefined);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }

  return AudioContext;
};
