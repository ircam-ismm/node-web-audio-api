
// const EndedEvent
// AudioRenderCapacityEvent
// OfflineAudioCompletionEvent
// AudioProcessingEvent

// All this seems to be true in Node.js context
// cf. https://nodejs.org/api/events.html#class-event
// dictionary EventInit {
//   boolean bubbles = false;
//   boolean cancelable = false;
//   boolean composed = false;
// };

module.exports.OfflineAudioCompletionEvent = class OfflineAudioCompletionEvent extends Event {

  #renderedBuffer = null;

  constructor(type, eventInitDict) {
    super(type);

    if (typeof eventInitDict !== 'object' || eventInitDict === null || !('renderedBuffer' in eventInitDict)) {
      throw TypeError("Failed to construct 'OfflineAudioCompletionEvent': Failed to read the 'renderedBuffer' property from 'OfflineAudioCompletionEvent': Required member is undefined.")
    }

    this.#renderedBuffer = eventInitDict.renderedBuffer;
  }

  get renderedBuffer() {
    return this.#renderedBuffer;
  }
}
