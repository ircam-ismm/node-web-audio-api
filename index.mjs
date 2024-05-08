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

// re-export index.cjs to support esm import syntax
// see https://github.com/nodejs/node/issues/40541#issuecomment-951609570

import {
  createRequire,
} from 'module';
const require = createRequire(import.meta.url);

const nativeModule = require('./index.cjs');
export const {
  // events
  OfflineAudioCompletionEvent,
  AudioProcessingEvent,
  AudioRenderCapacityEvent,

  // manually written nodes
  BaseAudioContext,
  AudioContext,
  OfflineAudioContext,

  AudioNode,
  AudioScheduledSourceNode,
  AudioParam,
  AudioDestinationNode,
  AudioListener,
  AudioWorklet,
  AudioParamMap,
  AudioRenderCapacity,

  PeriodicWave,
  AudioBuffer,
  // generated nodes
  ScriptProcessorNode,
  AudioWorkletNode,
  AnalyserNode,
  AudioBufferSourceNode,
  BiquadFilterNode,
  ChannelMergerNode,
  ChannelSplitterNode,
  ConstantSourceNode,
  ConvolverNode,
  DelayNode,
  DynamicsCompressorNode,
  GainNode,
  IIRFilterNode,
  MediaStreamAudioSourceNode,
  OscillatorNode,
  PannerNode,
  StereoPannerNode,
  WaveShaperNode,

  // helper methods
  mediaDevices,
} = nativeModule;

export default nativeModule;
