
let contextId = 0;

module.exports.patchAudioContext = function(NativeAudioContext) {
  class AudioContext extends NativeAudioContext {
    constructor(...args) {
      super(...args);
      // prevent garbage collection
      const processId = `__AudioContext_${contextId}`;
      process[processId] = this;
      this.__processId = processId;

      contextId += 1;
      // keep process awake
      this.__keepAwakeId = setInterval(() => {}, 10000);
    }

    // @todo
    // resume() {
    //   this.__keepAwakeId = setInterval(() => {}, 2000);
    //   return super.resume();
    // }

    // suspend() {
    //   // not sure to be confirmed
    //   clearTimeout(this.__keepAwakeId);
    //   return super.suspend();
    // }

    // close() {
    //    delete process[this.__processId];
    //    clearTimeout(this.__keepAwakeId);
    //    return super.close();
    // }
  }

  return AudioContext;
}
