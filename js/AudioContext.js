const { throwSanitizedError } = require('./lib/errors.js');
const { isFunction } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');

let contextId = 0;

const kProcessId = Symbol('processId');
const kKeepAwakeId = Symbol('keepAwakeId');

// constructor (optional AudioContextOptions contextOptions = {});
// readonly attribute double baseLatency;
// readonly attribute double outputLatency;
// [SecureContext] readonly attribute (DOMString or AudioSinkInfo) sinkId;
// [SecureContext] readonly attribute AudioRenderCapacity renderCapacity;
// attribute EventHandler onsinkchange;
// AudioTimestamp getOutputTimestamp ();
// Promise<undefined> resume ();
// Promise<undefined> suspend ();
// Promise<undefined> close ();
// [SecureContext] Promise<undefined> setSinkId ((DOMString or AudioSinkOptions) sinkId);
// MediaElementAudioSourceNode createMediaElementSource (HTMLMediaElement mediaElement);
// MediaStreamAudioSourceNode createMediaStreamSource (MediaStream mediaStream);
// MediaStreamTrackAudioSourceNode createMediaStreamTrackSource (
//     MediaStreamTrack mediaStreamTrack);
// MediaStreamAudioDestinationNode createMediaStreamDestination ();

module.exports = function(jsExport, nativeBinding) {
  class AudioContext extends jsExport.BaseAudioContext {
  // class AudioContext extends NativeAudioContext {
    constructor(options = {}) {
      let napiObj;

      try {
        napiObj = new nativeBinding.AudioContext(options);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(napiObj);

      // EventTarget ctor has been called so EventTarget[kDispatchEvent] is
      // bound to napiObj, then we can safely finalize event target initialization
      napiObj.__initEventTarget__();

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

      // clear on close
      this.addEventListener('statechange', () => {
        if (this.state === 'closed') {
          // allow to garbage collect the context and to the close the process
          delete process[this[kProcessId]];
          clearTimeout(this[kKeepAwakeId]);
        }
      });
    }

    get baseLatency() {
      return this[kNapiObj].baseLatency;
    }

    get outputLatency() {
      return this[kNapiObj].outputLatency;
    }

    get sinkId() {
      return this[kNapiObj].sinkId;
    }

    get renderCapacity() {
      throw new Error(`AudioContext::renderCapacity is not yet implemented`);
    }

    get onsinkchange() {
      return this._sinkchange || null;
    }

    set onsinkchange(value) {
      if (isFunction(value) || value === null) {
        this._sinkchange = value;
      }
    }

    getOutputTimestamp() {
      throw new Error(`AudioContext::getOutputTimestamp is not yet implemented`);
    }

    async resume() {
      await this[kNapiObj].resume();
    }

    async suspend() {
      await this[kNapiObj].suspend();
    }

    async close() {
      await this[kNapiObj].close();
    }

    setSinkId(sinkId) {
      try {
        this[kNapiObj].setSinkId(sinkId);
        return Promise.resolve(undefined);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // online context only AudioNodes
    createMediaStreamSource(mediaStream) {
      const options = {};

      if (mediaStream !== undefined) {
        options.mediaStream = mediaStream;
      }

      return new jsExport.MediaStreamAudioSourceNode(this, options);
    }

    createMediaElementSource() {
      throw new Error(`AudioContext::createMediaElementSource() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }

    createMediaStreamTrackSource() {
      throw new Error(`AudioContext::createMediaStreamTrackSource() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }

    createMediaStreamDestination() {
      throw new Error(`AudioContext::createMediaStreamDestination() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }
  }

  return AudioContext;
};
