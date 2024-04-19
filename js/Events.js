
// const EndedEvent
// AudioRenderCapacityEvent
// OfflineAudioCompletionEvent
// AudioProcessingEvent

// dictionary EventInit {
//   boolean bubbles = false;
//   boolean cancelable = false;
//   boolean composed = false;
// };

export class OfflineAudioCompletionEvent extends Event {

  #renderedBuffer = null;

  constructor(type, eventInitDict) {
    super(type);

  }

  get renderedBuffer() {
    return this.#renderedBuffer;
  }
}
