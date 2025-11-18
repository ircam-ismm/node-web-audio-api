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
// events
export const OfflineAudioCompletionEvent = nativeModule.OfflineAudioCompletionEvent;
export const AudioProcessingEvent = nativeModule.AudioProcessingEvent;
export const AudioRenderCapacityEvent = nativeModule.AudioRenderCapacityEvent;
// manually written nodes
export const BaseAudioContext = nativeModule.BaseAudioContext;
export const AudioContext = nativeModule.AudioContext;
export const OfflineAudioContext = nativeModule.OfflineAudioContext;

export const AudioNode = nativeModule.AudioNode;
export const AudioScheduledSourceNode = nativeModule.AudioScheduledSourceNode;
export const AudioParam = nativeModule.AudioParam;
export const AudioDestinationNode = nativeModule.AudioDestinationNode;
export const AudioListener = nativeModule.AudioListener;
export const AudioWorklet = nativeModule.AudioWorklet;
export const AudioParamMap = nativeModule.AudioParamMap;
export const AudioRenderCapacity = nativeModule.AudioRenderCapacity;

export const PeriodicWave = nativeModule.PeriodicWave;
export const AudioBuffer = nativeModule.AudioBuffer;
// generated nodes
export const ScriptProcessorNode = nativeModule.ScriptProcessorNode;
export const AudioWorkletNode = nativeModule.AudioWorkletNode;
export const AnalyserNode = nativeModule.AnalyserNode;
export const AudioBufferSourceNode = nativeModule.AudioBufferSourceNode;
export const BiquadFilterNode = nativeModule.BiquadFilterNode;
export const ChannelMergerNode = nativeModule.ChannelMergerNode;
export const ChannelSplitterNode = nativeModule.ChannelSplitterNode;
export const ConstantSourceNode = nativeModule.ConstantSourceNode;
export const ConvolverNode = nativeModule.ConvolverNode;
export const DelayNode = nativeModule.DelayNode;
export const DynamicsCompressorNode = nativeModule.DynamicsCompressorNode;
export const GainNode = nativeModule.GainNode;
export const IIRFilterNode = nativeModule.IIRFilterNode;
export const MediaStreamAudioSourceNode = nativeModule.MediaStreamAudioSourceNode;
export const OscillatorNode = nativeModule.OscillatorNode;
export const PannerNode = nativeModule.PannerNode;
export const StereoPannerNode = nativeModule.StereoPannerNode;
export const WaveShaperNode = nativeModule.WaveShaperNode;
// helper methods
export const mediaDevices = nativeModule.mediaDevices;

export default nativeModule;
