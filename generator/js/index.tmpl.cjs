const nativeBinding = require('./load-native.cjs');
const jsExport = {};

// --------------------------------------------------------------------------
// Events
// --------------------------------------------------------------------------
jsExport.OfflineAudioCompletionEvent = require('./js/Events').OfflineAudioCompletionEvent;
jsExport.AudioProcessingEvent = require('./js/Events').AudioProcessingEvent;
// --------------------------------------------------------------------------
// Create Web Audio API facade
// --------------------------------------------------------------------------
jsExport.BaseAudioContext = require('./js/BaseAudioContext.js')(jsExport, nativeBinding);
jsExport.AudioContext = require('./js/AudioContext.js')(jsExport, nativeBinding);
jsExport.OfflineAudioContext = require('./js/OfflineAudioContext.js')(jsExport, nativeBinding);

${d.nodes.map((node) => {
return `
jsExport.${d.name(node)} = require('./js/${d.name(node)}.js')(jsExport, nativeBinding);`
}).join('')}

jsExport.AudioNode = require('./js/AudioNode.js');
jsExport.AudioScheduledSourceNode = require('./js/AudioScheduledSourceNode.js');
jsExport.AudioParam = require('./js/AudioParam.js');
jsExport.AudioDestinationNode = require('./js/AudioDestinationNode.js');
jsExport.AudioListener = require('./js/AudioListener.js');
jsExport.AudioWorklet = require('./js/AudioWorklet.js');
jsExport.AudioParamMap = require('./js/AudioParamMap.js');

jsExport.PeriodicWave = require('./js/PeriodicWave.js')(jsExport, nativeBinding);
jsExport.AudioBuffer = require('./js/AudioBuffer.js')(jsExport, nativeBinding);

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

module.exports = jsExport;

