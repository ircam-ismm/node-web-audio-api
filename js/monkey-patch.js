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
  // --------------------------------------------------------------------------
  // Monkey Patch Web Audio API
  // --------------------------------------------------------------------------

  nativeBinding.AnalyserNode = require('./AnalyserNode.js')(nativeBinding.AnalyserNode, nativeBinding);
  nativeBinding.AudioBufferSourceNode = require('./AudioBufferSourceNode.js')(nativeBinding.AudioBufferSourceNode, nativeBinding);
  nativeBinding.BiquadFilterNode = require('./BiquadFilterNode.js')(nativeBinding.BiquadFilterNode, nativeBinding);
  nativeBinding.ChannelMergerNode = require('./ChannelMergerNode.js')(nativeBinding.ChannelMergerNode, nativeBinding);
  nativeBinding.ChannelSplitterNode = require('./ChannelSplitterNode.js')(nativeBinding.ChannelSplitterNode, nativeBinding);
  nativeBinding.ConstantSourceNode = require('./ConstantSourceNode.js')(nativeBinding.ConstantSourceNode, nativeBinding);
  nativeBinding.ConvolverNode = require('./ConvolverNode.js')(nativeBinding.ConvolverNode, nativeBinding);
  nativeBinding.DelayNode = require('./DelayNode.js')(nativeBinding.DelayNode, nativeBinding);
  nativeBinding.DynamicsCompressorNode = require('./DynamicsCompressorNode.js')(nativeBinding.DynamicsCompressorNode, nativeBinding);
  nativeBinding.GainNode = require('./GainNode.js')(nativeBinding.GainNode, nativeBinding);
  nativeBinding.IIRFilterNode = require('./IIRFilterNode.js')(nativeBinding.IIRFilterNode, nativeBinding);
  nativeBinding.MediaStreamAudioSourceNode = require('./MediaStreamAudioSourceNode.js')(nativeBinding.MediaStreamAudioSourceNode, nativeBinding);
  nativeBinding.OscillatorNode = require('./OscillatorNode.js')(nativeBinding.OscillatorNode, nativeBinding);
  nativeBinding.PannerNode = require('./PannerNode.js')(nativeBinding.PannerNode, nativeBinding);
  nativeBinding.StereoPannerNode = require('./StereoPannerNode.js')(nativeBinding.StereoPannerNode, nativeBinding);
  nativeBinding.WaveShaperNode = require('./WaveShaperNode.js')(nativeBinding.WaveShaperNode, nativeBinding);

  nativeBinding.PeriodicWave = require('./PeriodicWave.js')(nativeBinding.PeriodicWave);
  nativeBinding.AudioBuffer = require('./AudioBuffer.js').AudioBuffer(nativeBinding.AudioBuffer);

  nativeBinding.AudioContext = require('./AudioContext.js')(nativeBinding);
  nativeBinding.OfflineAudioContext = require('./OfflineAudioContext.js')(nativeBinding);

  // @todo - make the constructor private
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
