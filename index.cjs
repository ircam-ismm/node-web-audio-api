// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

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

jsExport.ScriptProcessorNode = require('./js/ScriptProcessorNode.js')(jsExport, nativeBinding);
jsExport.AudioWorkletNode = require('./js/AudioWorkletNode.js')(jsExport, nativeBinding);
jsExport.AnalyserNode = require('./js/AnalyserNode.js')(jsExport, nativeBinding);
jsExport.AudioBufferSourceNode = require('./js/AudioBufferSourceNode.js')(jsExport, nativeBinding);
jsExport.BiquadFilterNode = require('./js/BiquadFilterNode.js')(jsExport, nativeBinding);
jsExport.ChannelMergerNode = require('./js/ChannelMergerNode.js')(jsExport, nativeBinding);
jsExport.ChannelSplitterNode = require('./js/ChannelSplitterNode.js')(jsExport, nativeBinding);
jsExport.ConstantSourceNode = require('./js/ConstantSourceNode.js')(jsExport, nativeBinding);
jsExport.ConvolverNode = require('./js/ConvolverNode.js')(jsExport, nativeBinding);
jsExport.DelayNode = require('./js/DelayNode.js')(jsExport, nativeBinding);
jsExport.DynamicsCompressorNode = require('./js/DynamicsCompressorNode.js')(jsExport, nativeBinding);
jsExport.GainNode = require('./js/GainNode.js')(jsExport, nativeBinding);
jsExport.IIRFilterNode = require('./js/IIRFilterNode.js')(jsExport, nativeBinding);
jsExport.MediaStreamAudioSourceNode = require('./js/MediaStreamAudioSourceNode.js')(jsExport, nativeBinding);
jsExport.OscillatorNode = require('./js/OscillatorNode.js')(jsExport, nativeBinding);
jsExport.PannerNode = require('./js/PannerNode.js')(jsExport, nativeBinding);
jsExport.StereoPannerNode = require('./js/StereoPannerNode.js')(jsExport, nativeBinding);
jsExport.WaveShaperNode = require('./js/WaveShaperNode.js')(jsExport, nativeBinding);

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
