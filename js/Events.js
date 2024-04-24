const { kEnumerableProperty } = require('./lib/utils.js');

class OfflineAudioCompletionEvent extends Event {
  #renderedBuffer = null;

  constructor(type, eventInitDict) {
    super(type);

    if (typeof eventInitDict !== 'object' || eventInitDict === null || !('renderedBuffer' in eventInitDict)) {
      throw TypeError(`Failed to construct 'OfflineAudioCompletionEvent': Failed to read the 'renderedBuffer' property from 'OfflineAudioCompletionEvent': Required member is undefined.`);
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
      throw TypeError(`Failed to construct 'AudioProcessingEvent': Invalid 'AudioProcessingEventInit' given`);
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

module.exports.OfflineAudioCompletionEvent = OfflineAudioCompletionEvent;
module.exports.AudioProcessingEvent = AudioProcessingEvent;
