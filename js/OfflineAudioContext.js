const { NotSupportedError } = require('./lib/errors.js');
const { isPlainObject, isPositiveInt, isPositiveNumber } = require('./lib/utils.js');

module.exports = function patchOfflineAudioContext(NativeOfflineAudioContext) {
  class OfflineAudioContext extends NativeOfflineAudioContext {
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
    }

    // promisify sync APIs
    async startRendering() {
      try {
        const audioBuffer = await super.startRendering();
        return Promise.resolve(audioBuffer);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    decodeAudioData(audioData) {
      if (!(audioData instanceof ArrayBuffer)) {
        throw new TypeError(`Failed to execute 'decodeAudioData': parameter 1 is not of type 'ArrayBuffer'`);
      }

      try {
        const audioBuffer = super.decodeAudioData(audioData);
        return Promise.resolve(audioBuffer);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }

  return OfflineAudioContext;
}
