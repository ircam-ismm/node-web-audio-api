const { NotSupportedError } = require('./lib/errors.js');
const { isPlainObject, isPositiveInt, isPositiveNumber } = require('./lib/utils.js');

module.exports = function patchOfflineAudioContext(bindings) {
  // @todo - EventTarget
  // - https://github.com/orottier/web-audio-api-rs/issues/411
  // - https://github.com/orottier/web-audio-api-rs/issues/416

  const EventTarget = require('./EventTarget.mixin.js')(bindings.OfflineAudioContext, ['statechange']);
  const BaseAudioContext = require('./BaseAudioContext.mixin.js')(EventTarget, bindings);

  class OfflineAudioContext extends BaseAudioContext {
    constructor(...args) {
      // handle initialisation with either an options object or a sequence of parameters
      // https://webaudio.github.io/web-audio-api/#dom-offlineaudiocontext-constructor-contextoptions-contextoptions
      if (isPlainObject(args[0])
          && 'numberOfChannels' in args[0] && 'length' in args[0] && 'sampleRate' in args[0]
      ) {
        const { numberOfChannels, length, sampleRate } = args[0];
        args = [numberOfChannels, length, sampleRate];
      }

      const [numberOfChannels, length, sampleRate] = args;

      if (!isPositiveInt(numberOfChannels)) {
        throw new NotSupportedError(`Invalid value for numberOfChannels: ${numberOfChannels}`);
      } else if (!isPositiveInt(length)) {
        throw new NotSupportedError(`Invalid value for length: ${length}`);
      } else if (!isPositiveNumber(sampleRate)) {
        throw new NotSupportedError(`Invalid value for sampleRate: ${sampleRate}`);
      }

      super(numberOfChannels, length, sampleRate);

      // @todo - do not init the event target, no way to clean the thread safe
      // functions for now

      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      // super.__initEventTarget__();
    }
  }

  return OfflineAudioContext;
};
