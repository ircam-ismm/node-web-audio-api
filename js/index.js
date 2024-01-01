module.exports = function monkeyPatch(nativeBinding) {
  // --------------------------------------------------------------------------
  // Monkey Patch Web Audio API
  // --------------------------------------------------------------------------
  nativeBinding.AudioBufferSourceNode = require('./AudioBufferSourceNode.js')(nativeBinding.AudioBufferSourceNode);
  nativeBinding.ConstantSourceNode = require('./ConstantSourceNode.js')(nativeBinding.ConstantSourceNode);
  nativeBinding.OscillatorNode = require('./OscillatorNode.js')(nativeBinding.OscillatorNode);


  nativeBinding.AudioContext = require('./AudioContext.js')(nativeBinding);
  nativeBinding.OfflineAudioContext = require('./OfflineAudioContext.js')(nativeBinding);

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
