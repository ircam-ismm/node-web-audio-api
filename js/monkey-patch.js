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

module.exports = function monkeyPatch(nativeBinding) {
  let jsExport = {};

  // --------------------------------------------------------------------------
  // Events
  // --------------------------------------------------------------------------
  jsExport.OfflineAudioCompletionEvent = require('./Events').OfflineAudioCompletionEvent;
  // --------------------------------------------------------------------------
  // Create Web Audio API facade
  // --------------------------------------------------------------------------
  jsExport.BaseAudioContext = require('./BaseAudioContext.js')(jsExport, nativeBinding);
  jsExport.AudioContext = require('./AudioContext.js')(jsExport, nativeBinding);
  jsExport.OfflineAudioContext = require('./OfflineAudioContext.js')(jsExport, nativeBinding);

  jsExport.AnalyserNode = require('./AnalyserNode.js')(jsExport, nativeBinding);
  jsExport.AudioBufferSourceNode = require('./AudioBufferSourceNode.js')(jsExport, nativeBinding);
  jsExport.BiquadFilterNode = require('./BiquadFilterNode.js')(jsExport, nativeBinding);
  jsExport.ChannelMergerNode = require('./ChannelMergerNode.js')(jsExport, nativeBinding);
  jsExport.ChannelSplitterNode = require('./ChannelSplitterNode.js')(jsExport, nativeBinding);
  jsExport.ConstantSourceNode = require('./ConstantSourceNode.js')(jsExport, nativeBinding);
  jsExport.ConvolverNode = require('./ConvolverNode.js')(jsExport, nativeBinding);
  jsExport.DelayNode = require('./DelayNode.js')(jsExport, nativeBinding);
  jsExport.DynamicsCompressorNode = require('./DynamicsCompressorNode.js')(jsExport, nativeBinding);
  jsExport.GainNode = require('./GainNode.js')(jsExport, nativeBinding);
  jsExport.IIRFilterNode = require('./IIRFilterNode.js')(jsExport, nativeBinding);
  jsExport.MediaStreamAudioSourceNode = require('./MediaStreamAudioSourceNode.js')(jsExport, nativeBinding);
  jsExport.OscillatorNode = require('./OscillatorNode.js')(jsExport, nativeBinding);
  jsExport.PannerNode = require('./PannerNode.js')(jsExport, nativeBinding);
  jsExport.StereoPannerNode = require('./StereoPannerNode.js')(jsExport, nativeBinding);
  jsExport.WaveShaperNode = require('./WaveShaperNode.js')(jsExport, nativeBinding);

  jsExport.AudioNode = require('./AudioNode.js');
  jsExport.AudioScheduledSourceNode = require('./AudioScheduledSourceNode.js');
  jsExport.AudioParam = require('./AudioParam.js');
  jsExport.AudioDestinationNode = require('./AudioDestinationNode.js');
  jsExport.AudioListener = require('./AudioListener.js');

  jsExport.PeriodicWave = require('./PeriodicWave.js')(jsExport, nativeBinding);
  jsExport.AudioBuffer = require('./AudioBuffer.js')(jsExport, nativeBinding);

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
