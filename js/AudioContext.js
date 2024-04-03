const { throwSanitizedError } = require('./lib/errors.js');
const { isFunction, kEnumerableProperty } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');
const { bridgeEventTarget } = require('./lib/events.js');

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
    constructor(options = {}) {
      let napiObj;

      try {
        napiObj = new nativeBinding.AudioContext(options);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(napiObj);

      // Bridge Rust native event to Node EventTarget
      bridgeEventTarget(this);

      // @todo - check if this is still required
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
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      if (isFunction(value) || value === null) {
        this._sinkchange = value;
      }
    }

    getOutputTimestamp() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::getOutputTimestamp is not yet implemented`);
    }

    async resume() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      await this[kNapiObj].resume();
    }

    async suspend() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      await this[kNapiObj].suspend();
    }

    async close() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      await this[kNapiObj].close();
    }

    setSinkId(sinkId) {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'setSinkId' on 'AudioContext': 1 argument required, but only ${arguments.length} present`);
      }

      try {
        this[kNapiObj].setSinkId(sinkId);
        return Promise.resolve(undefined);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // online context only AudioNodes
    createMediaStreamSource(mediaStream) {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      if (arguments.length < 1) {
        throw new TypeError(`Failed to execute 'createMediaStreamSource' on 'AudioContext': 1 argument required, but only ${arguments.length} present`);
      }

      const options = {};

      if (mediaStream !== undefined) {
        options.mediaStream = mediaStream;
      }

      return new jsExport.MediaStreamAudioSourceNode(this, options);
    }

    createMediaElementSource() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::createMediaElementSource() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }

    createMediaStreamTrackSource() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::createMediaStreamTrackSource() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }

    createMediaStreamDestination() {
      if (!(this instanceof AudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
      }

      throw new Error(`AudioContext::createMediaStreamDestination() is not yet implemented, cf. https://github.com/ircam-ismm/node-web-audio-api/issues/91 for more information`);
    }
  }

  Object.defineProperties(AudioContext, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 0,
    },
  });

  Object.defineProperties(AudioContext.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'AudioContext',
    },

    baseLatency: kEnumerableProperty,
    outputLatency: kEnumerableProperty,
    sinkId: kEnumerableProperty,
    renderCapacity: kEnumerableProperty,
    onsinkchange: kEnumerableProperty,
    getOutputTimestamp: kEnumerableProperty,
    resume: kEnumerableProperty,
    suspend: kEnumerableProperty,
    close: kEnumerableProperty,
    setSinkId: kEnumerableProperty,
    createMediaStreamSource: kEnumerableProperty,
    createMediaElementSource: kEnumerableProperty,
    createMediaStreamTrackSource: kEnumerableProperty,
    createMediaStreamDestination: kEnumerableProperty,
  });

  return AudioContext;
};
