const { kEnumerableProperty } = require('./lib/utils.js');

class OfflineAudioCompletionEvent extends Event {
  #renderedBuffer = null;

  constructor(type, eventInitDict) {
    super(type);

    if (
      typeof eventInitDict !== 'object'
      || eventInitDict === null
      || !('renderedBuffer' in eventInitDict)
    ) {
      throw TypeError(`Failed to construct 'OfflineAudioCompletionEvent': Invalid 'OfflineAudioCompletionEventInit' dict given`);
    }

    this.#renderedBuffer = eventInitDict.renderedBuffer;
  }

  get renderedBuffer() {
    return this.#renderedBuffer;
  }
}

Object.defineProperties(OfflineAudioCompletionEvent.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'OfflineAudioCompletionEvent',
  },

  renderedBuffer: kEnumerableProperty,
});

class AudioProcessingEvent extends Event {
  #playbackTime = null;
  #inputBuffer = null;
  #outputBuffer = null;

  constructor(type, eventInitDict) {
    if (
      typeof eventInitDict !== 'object'
      || eventInitDict === null
      || !('playbackTime' in eventInitDict)
      || !('inputBuffer' in eventInitDict)
      || !('outputBuffer' in eventInitDict)
    ) {
      throw TypeError(`Failed to construct 'AudioProcessingEvent': Invalid 'AudioProcessingEventInit' dict given`);
    }

    super(type);

    this.#playbackTime = eventInitDict.playbackTime;
    this.#inputBuffer = eventInitDict.inputBuffer;
    this.#outputBuffer = eventInitDict.outputBuffer;
  }

  get playbackTime() {
    return this.#playbackTime;
  }

  get inputBuffer() {
    return this.#inputBuffer;
  }

  get outputBuffer() {
    return this.#outputBuffer;
  }
}

Object.defineProperties(AudioProcessingEvent.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioProcessingEvent',
  },

  playbackTime: kEnumerableProperty,
  inputBuffer: kEnumerableProperty,
  outputBuffer: kEnumerableProperty,
});

class AudioRenderCapacityEvent extends Event {
  #timestamp = 0;
  #averageLoad = 0;
  #peakLoad = 0;
  #underrunRatio = 0;

  constructor(type, eventInitDict) {
    if (
      typeof eventInitDict !== 'object'
      || eventInitDict === null
      || !('timestamp' in eventInitDict)
      || !('averageLoad' in eventInitDict)
      || !('peakLoad' in eventInitDict)
      || !('underrunRatio' in eventInitDict)
    ) {
      throw TypeError(`Failed to construct 'AudioRenderCapacityEvent': Invalid 'AudioRenderCapacityEventInit' dict given`);
    }

    super(type);

    this.#timestamp = eventInitDict.timestamp;
    this.#averageLoad = eventInitDict.averageLoad;
    this.#peakLoad = eventInitDict.peakLoad;
    this.#underrunRatio = eventInitDict.underrunRatio;
  }

  get timestamp() {
    return this.#timestamp;
  }

  get averageLoad() {
    return this.#averageLoad;
  }

  get peakLoad() {
    return this.#peakLoad;
  }

  get underrunRatio() {
    return this.#underrunRatio;
  }
}

Object.defineProperties(AudioRenderCapacityEvent.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioRenderCapacityEvent',
  },

  timestamp: kEnumerableProperty,
  averageLoad: kEnumerableProperty,
  peakLoad: kEnumerableProperty,
  underrunRatio: kEnumerableProperty,
});

module.exports.OfflineAudioCompletionEvent = OfflineAudioCompletionEvent;
module.exports.AudioProcessingEvent = AudioProcessingEvent;
module.exports.AudioRenderCapacityEvent = AudioRenderCapacityEvent;
