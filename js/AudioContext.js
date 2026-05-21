import conversions from 'webidl-conversions';

import nativeBinding from '../load-native.js';
import {
  throwSanitizedError,
} from './lib/errors.js';
import {
  isFunction,
  kEnumerableProperty,
} from './lib/utils.js';
import {
  kNapiObj,
  kWorkletRelease,
} from './lib/symbols.js';
import {
  propagateEvent,
} from './lib/events.js';

import { BaseAudioContext } from './BaseAudioContext.js';
import { AudioRenderCapacity } from './AudioRenderCapacity.js';
import { AudioPlaybackStats } from './AudioPlaybackStats.js';
import { MediaStreamAudioSourceNode } from './MediaStreamAudioSourceNode.js';

let contextId = 0;

export class AudioContext extends BaseAudioContext {
  #sinkId = '';
  #renderCapacity = null;
  #playbackStats = null;
  #onsinkchange = null;
  #keepAwakeId = null;
  #kAudioContextId = null;

  constructor(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError(`Failed to construct 'AudioContext': The provided value is not of type 'AudioContextOptions'`);
    }

    let targetOptions = {};

    if (options.latencyHint !== undefined) {
      if (['balanced', 'interactive', 'playback'].includes(options.latencyHint)) {
        targetOptions.latencyHint = conversions['DOMString'](options.latencyHint);
      } else {
        targetOptions.latencyHint = conversions['double'](options.latencyHint, {
          context: `Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions: The provided value (${options.latencyHint})`,
        });
      }
    } else {
      targetOptions.latencyHint = 'interactive';
    }

    if (options.sampleRate !== undefined) {
      targetOptions.sampleRate = conversions['float'](options.sampleRate, {
        context: `Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions: The provided value (${options.sampleRate})`,
      });
    } else {
      targetOptions.sampleRate = null;
    }

    if (options.sinkId !== undefined) {
      if (typeof options.sinkId === 'object') {
        // https://webaudio.github.io/web-audio-api/#enumdef-audiosinktype
        if (!('type' in options.sinkId) || options.sinkId.type !== 'none') {
          throw TypeError(`Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions: Failed to read the 'type' property from 'AudioSinkOptions': The provided value (${options.sinkId.type}) is not a valid enum value of type AudioSinkType.`);
        }

        targetOptions.sinkId = 'none';
      } else {
        targetOptions.sinkId = conversions['DOMString'](options.sinkId, {
          context: `Failed to construct 'AudioContext': Failed to read the 'sinkId' property from AudioNodeOptions:  Failed to read the 'type' property from 'AudioSinkOptions': The provided value (${options.sinkId})`,
        });
      }
    } else {
      targetOptions.sinkId = '';
    }

    let napiObj;

    try {
      napiObj = new nativeBinding.NapiAudioContext(targetOptions);
    } catch (err) {
      throwSanitizedError(err);
    }

    super({ [kNapiObj]: napiObj });

    if (options.sinkId !== undefined) {
      this.#sinkId = options.sinkId;
    }

    this.#renderCapacity = new AudioRenderCapacity({
      [kNapiObj]: this[kNapiObj].renderCapacity,
    });

    this.#playbackStats = new AudioPlaybackStats({
      [kNapiObj]: this[kNapiObj].playbackStats,
    });

    this[kNapiObj].onstatechange((function(napiEvent) {
      const event = new Event(napiEvent.type);
      propagateEvent(this, event);
    }).bind(this));

    this[kNapiObj].onsinkchange((function(napiEvent) {
      const event = new Event(napiEvent.type);
      propagateEvent(this, event);
    }).bind(this));

    // prevent garbage collection and process exit
    this.#kAudioContextId = Symbol(`node-web-audio-api:audio-context-${contextId++}`);
    Object.defineProperty(process, this.#kAudioContextId, {
      __proto__: null,
      enumerable: false,
      configurable: true,
      value: this,
    });

    this.#keepAwakeId = setInterval(() => {}, 10 * 1000);

    // force the context to close in WPT, see ./.scripts/wpt_harness.js for information
    if (process.WPT_TEST_RUNNER) {
      process.WPT_TEST_RUNNER.once('cleanup', () => this.close());
    }
  }

  get baseLatency() {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    return this[kNapiObj].baseLatency;
  }

  get outputLatency() {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    return this[kNapiObj].outputLatency;
  }

  get sinkId() {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    return this.#sinkId;
  }

  get renderCapacity() {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    return this.#renderCapacity;
  }

  get playbackStats() {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    return this.#playbackStats;
  }

  get onsinkchange() {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    return this.#onsinkchange;
  }

  set onsinkchange(value) {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    if (isFunction(value) || value === null) {
      this.#onsinkchange = value;
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

    // Close audioWorklet first so that `run_audio_worklet_global_scope` exit first
    // The other way around works too because of `recv_timeout` but cleaner this way
    await this.audioWorklet[kWorkletRelease]();
    await this[kNapiObj].close();
    // allow process to terminate
    clearInterval(this.#keepAwakeId);
    delete process[this.#kAudioContextId];
  }

  async setSinkId(sinkId) {
    if (!(this instanceof AudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioContext\'');
    }

    if (arguments.length < 1) {
      throw new TypeError(`Failed to execute 'setSinkId' on 'AudioContext': 1 argument required, but only ${arguments.length} present`);
    }

    let targetSinkId = '';

    if (typeof sinkId === 'object') {
      if (!('type' in sinkId) || sinkId.type !== 'none') {
        throw new TypeError(`Failed to execute 'setSinkId' on 'AudioContext': Failed to read the 'type' property from 'AudioSinkOptions': The provided value '${sinkId.type}' is not a valid enum value of type AudioSinkType.`);
      }

      targetSinkId = 'none';
    } else {
      targetSinkId = conversions['DOMString'](sinkId, {
        context: `Failed to execute 'setSinkId' on 'AudioContext': Failed to read the 'type' property from 'AudioSinkOptions': The provided value '${sinkId.type}'`,
      });
    }

    try {
      await this[kNapiObj].setSinkId(targetSinkId);
      this.#sinkId = sinkId;
    } catch (err) {
      throwSanitizedError(err);
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

    const options = {
      mediaStream,
    };

    return new MediaStreamAudioSourceNode(this, options);
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
