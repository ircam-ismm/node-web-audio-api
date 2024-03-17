const { nameCodeMap, DOMException } = require('./lib/errors.js');
const { isPlainObject, isPositiveInt, isPositiveNumber } = require('./lib/utils.js');
const { kNativeAudioBuffer } = require('./AudioBuffer.js');

module.exports = function patchOfflineAudioContext(bindings) {
  const AudioBuffer = bindings.AudioBuffer;

  // @todo - EventTarget
  // - https://github.com/orottier/web-audio-api-rs/issues/411
  // - https://github.com/orottier/web-audio-api-rs/issues/416
  const EventTarget = require('./EventTarget.mixin.js')(bindings.OfflineAudioContext, ['statechange']);
  const BaseAudioContext = require('./BaseAudioContext.mixin.js')(EventTarget, bindings);

  class OfflineAudioContext extends BaseAudioContext {
    constructor(...args) {
      // handle initialisation with either an options object or a sequence of parameters
      // https://webaudio.github.io/web-audio-api/#dom-offlineaudiocontext-constructor-contextoptions-contextoptions
      if (isPlainObject(args[0]) && 'length' in args[0] && 'sampleRate' in args[0]
      ) {
        let { numberOfChannels, length, sampleRate } = args[0];
        if (numberOfChannels === undefined) {
            numberOfChannels = 1;
        }
        args = [numberOfChannels, length, sampleRate];
      }

      const [numberOfChannels, length, sampleRate] = args;

      if (!isPositiveInt(numberOfChannels)) {
        throw new TypeError(`Invalid value for numberOfChannels: ${numberOfChannels}`);
      } else if (!isPositiveInt(length)) {
        throw new TypeError(`Invalid value for length: ${length}`);
      } else if (!isPositiveNumber(sampleRate)) {
        throw new TypeError(`Invalid value for sampleRate: ${sampleRate}`);
      }

      super(numberOfChannels, length, sampleRate);

      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();
    }

    async startRendering() {
      const nativeAudioBuffer = await super.startRendering();
      const audioBuffer = new AudioBuffer({ [kNativeAudioBuffer]: nativeAudioBuffer });

      // We dispatch the complete envet manually to simplify the sharing of the
      // `AudioBuffer` instance. This also simplifies code on the rust side as
      // we don't need to deal with the `OfflineAudioCompletionEvent` type.
      const event = new Event('complete');
      event.renderedBuffer = audioBuffer;
      this.dispatchEvent(event);

      return audioBuffer;
    }
  }

  return OfflineAudioContext;
};
