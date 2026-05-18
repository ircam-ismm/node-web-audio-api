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

const cjsModule = require('./index.cjs');
// events
export const OfflineAudioCompletionEvent = cjsModule.OfflineAudioCompletionEvent;
export const AudioProcessingEvent = cjsModule.AudioProcessingEvent;
export const AudioRenderCapacityEvent = cjsModule.AudioRenderCapacityEvent;
export const ErrorEvent = cjsModule.ErrorEvent;
// manually written nodes
export const BaseAudioContext = cjsModule.BaseAudioContext;
export const AudioContext = cjsModule.AudioContext;
export const OfflineAudioContext = cjsModule.OfflineAudioContext;

export const AudioNode = cjsModule.AudioNode;
export const AudioScheduledSourceNode = cjsModule.AudioScheduledSourceNode;
export const AudioParam = cjsModule.AudioParam;
export const AudioDestinationNode = cjsModule.AudioDestinationNode;
export const AudioListener = cjsModule.AudioListener;
export const AudioWorklet = cjsModule.AudioWorklet;
export const AudioParamMap = cjsModule.AudioParamMap;
export const AudioRenderCapacity = cjsModule.AudioRenderCapacity;
export const AudioPlaybackStats = cjsModule.AudioPlaybackStats;

export const PeriodicWave = cjsModule.PeriodicWave;
export const AudioBuffer = cjsModule.AudioBuffer;

// generated nodes
export const ScriptProcessorNode = cjsModule.ScriptProcessorNode;
export const AudioWorkletNode = cjsModule.AudioWorkletNode;
export const AnalyserNode = cjsModule.AnalyserNode;
export const AudioBufferSourceNode = cjsModule.AudioBufferSourceNode;
export const BiquadFilterNode = cjsModule.BiquadFilterNode;
export const ChannelMergerNode = cjsModule.ChannelMergerNode;
export const ChannelSplitterNode = cjsModule.ChannelSplitterNode;
export const ConstantSourceNode = cjsModule.ConstantSourceNode;
export const ConvolverNode = cjsModule.ConvolverNode;
export const DelayNode = cjsModule.DelayNode;
export const DynamicsCompressorNode = cjsModule.DynamicsCompressorNode;
export const GainNode = cjsModule.GainNode;
export const IIRFilterNode = cjsModule.IIRFilterNode;
export const MediaStreamAudioSourceNode = cjsModule.MediaStreamAudioSourceNode;
export const OscillatorNode = cjsModule.OscillatorNode;
export const PannerNode = cjsModule.PannerNode;
export const StereoPannerNode = cjsModule.StereoPannerNode;
export const WaveShaperNode = cjsModule.WaveShaperNode;
// helper methods
export const mediaDevices = cjsModule.mediaDevices;

export default cjsModule;
