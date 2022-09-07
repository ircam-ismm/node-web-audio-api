
let contextId = 0;

module.exports.patchAudioContext = function(NativeAudioContext) {
  class AudioContext extends NativeAudioContext {
    constructor(...args) {
      super(...args);
      // store in process to avoid consumer having to do it
      const processId = `__AudioContext_${contextId}`;
      process[processId] = this;

      contextId += 1;

      this.__processId = processId;
      this.__keepAwakeId = setInterval(() => {}, 10000);
    }

    // @todo
    // resume() {
    //   this.__keepAwakeId = setInterval(() => {}, 2000);
    //   return super.resume();
    // }

    // suspend() {
    //   clearTimeout(this.__keepAwakeId);
    //   return super.suspend();
    // }

    // close() {
    //    delete process[this.__processId];
    //    return super.close();
    // }
  }

  return AudioContext;
}
