module.exports = function monkeyPatch(nativeBinding) {
  // --------------------------------------------------------------------------
  // Monkey Patch Web Audio API
  // --------------------------------------------------------------------------
${d.nodes.map((node) => {
  return `
  nativeBinding.${d.name(node)} = require('./${d.name(node)}.js')(nativeBinding.${d.name(node)});`
}).join('')}

  nativeBinding.AudioContext = require('./AudioContext.js')(nativeBinding);
  nativeBinding.OfflineAudioContext = require('./OfflineAudioContext.js')(nativeBinding);

  // find a way to make the constructor private
  nativeBinding.AudioParam = require('./AudioParam.js').AudioParam;
  nativeBinding.AudioDestinationNode = require('./AudioDestinationNode.js').AudioDestinationNode;

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
      throw new TypeError('Failed to execute "getUserMedia" on "MediaDevices": audio must be requested');
    }

    const stream = getUserMediaSync(options);
    return Promise.resolve(stream);
  };

  return nativeBinding;
};

