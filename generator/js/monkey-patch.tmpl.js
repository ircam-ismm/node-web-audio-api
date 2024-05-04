module.exports = function monkeyPatch(nativeBinding) {
  let jsExport = {};

  // --------------------------------------------------------------------------
  // Events
  // --------------------------------------------------------------------------
  jsExport.OfflineAudioCompletionEvent = require('./Events').OfflineAudioCompletionEvent;
  jsExport.AudioProcessingEvent = require('./Events').AudioProcessingEvent;
  // --------------------------------------------------------------------------
  // Create Web Audio API facade
  // --------------------------------------------------------------------------
  jsExport.BaseAudioContext = require('./BaseAudioContext.js')(jsExport, nativeBinding);
  jsExport.AudioContext = require('./AudioContext.js')(jsExport, nativeBinding);
  jsExport.OfflineAudioContext = require('./OfflineAudioContext.js')(jsExport, nativeBinding);

${d.nodes.map((node) => {
  return `
  jsExport.${d.name(node)} = require('./${d.name(node)}.js')(jsExport, nativeBinding);`
}).join('')}

  jsExport.AudioNode = require('./AudioNode.js');
  jsExport.AudioScheduledSourceNode = require('./AudioScheduledSourceNode.js');
  jsExport.AudioParam = require('./AudioParam.js');
  jsExport.AudioDestinationNode = require('./AudioDestinationNode.js');
  jsExport.AudioListener = require('./AudioListener.js');

  jsExport.PeriodicWave = require('./PeriodicWave.js')(jsExport, nativeBinding);
  jsExport.AudioBuffer = require('./AudioBuffer.js')(jsExport, nativeBinding);

  // --------------------------------------------------------------------------
  // AudioWorklet utils (internal)
  // --------------------------------------------------------------------------
  jsExport.register_params = nativeBinding.register_params;
  jsExport.run_audio_worklet = nativeBinding.run_audio_worklet;

  // --------------------------------------------------------------------------
  // Promisify MediaDevices API
  // --------------------------------------------------------------------------
  jsExport.mediaDevices = {};

  const enumerateDevicesSync = nativeBinding.mediaDevices.enumerateDevices;
  jsExport.mediaDevices.enumerateDevices = async function enumerateDevices() {
    const list = enumerateDevicesSync();
    return Promise.resolve(list);
  };

  const getUserMediaSync = nativeBinding.mediaDevices.getUserMedia;
  jsExport.mediaDevices.getUserMedia = async function getUserMedia(options) {
    if (options === undefined) {
      throw new TypeError('Failed to execute "getUserMedia" on "MediaDevices": audio must be requested');
    }

    const stream = getUserMediaSync(options);
    return Promise.resolve(stream);
  };

  return jsExport;
};

