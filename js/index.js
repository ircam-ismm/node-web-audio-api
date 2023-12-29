const patchAudioContext = require('./AudioContext.js');
const patchOfflineAudioContext = require('./OfflineAudioContext.js');

module.exports = function monkeyPatch(nativeBinding) {
  // --------------------------------------------------------------------------
  // Monkey Patch Web Audio API
  // --------------------------------------------------------------------------
  nativeBinding.AudioContext = patchAudioContext(nativeBinding.AudioContext);
  nativeBinding.OfflineAudioContext = patchOfflineAudioContext(nativeBinding.OfflineAudioContext);

  // --------------------------------------------------------------------------
  // Promisify MediaDevices API
  // --------------------------------------------------------------------------
  const enumerateDevicesSync = nativeBinding.mediaDevices.enumerateDevices;
  nativeBinding.mediaDevices.enumerateDevices = async function enumerateDevices() {
    const list = enumerateDevicesSync();
    return Promise.resolve(list);
  };

  const getUserMediaSync = nativeBinding.mediaDevices.getUserMedia;
  nativeBinding.mediaDevices.getUserMedia = async function getUserMedia(options) {
    if (options === undefined) {
      throw new TypeError(`Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested`);
    }

    const stream = getUserMediaSync(options);
    return Promise.resolve(stream);
  };

  return nativeBinding;
};
