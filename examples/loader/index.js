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

import path from 'node:path';
import fs from 'node:fs';

const examplesDirname = path.join(import.meta.dirname, '..');
const examplesNodeModules = path.join(examplesDirname, 'node_modules');
const nodeModulesExists = fs.existsSync(examplesNodeModules);

let mod;

if (nodeModulesExists) {
  console.log('> loading installed dependency');
  mod = await import('node-web-audio-api');;
} else {
  console.log('> loading local build');
  mod = await import('../../index.js');
}

export const OfflineAudioCompletionEvent = mod.OfflineAudioCompletionEvent;
export const AudioProcessingEvent = mod.AudioProcessingEvent;
export const AudioRenderCapacityEvent = mod.AudioRenderCapacityEvent;
export const ErrorEvent = mod.ErrorEvent;

export const BaseAudioContext = mod.BaseAudioContext;
export const AudioContext = mod.AudioContext;
export const OfflineAudioContext = mod.OfflineAudioContext;

export const AudioBuffer = mod.AudioBuffer;
export const PeriodicWave = mod.PeriodicWave;
export const AudioListener = mod.AudioListener;
export const AudioDestinationNode = mod.AudioDestinationNode;
export const AudioParamMap = mod.AudioParamMap;
export const AudioPlaybackStats = mod.AudioPlaybackStats;
export const AudioRenderCapacity = mod.AudioRenderCapacity;
export const AudioScheduledSourceNode = mod.AudioScheduledSourceNode;
export const AudioWorklet = mod.AudioWorklet;
// generated entities
export const AudioParam = mod.AudioParam;
export const AudioNode = mod.AudioNode;
// all audio nodes
export const ScriptProcessorNode = mod.ScriptProcessorNode;
export const AudioWorkletNode = mod.AudioWorkletNode;
export const AnalyserNode = mod.AnalyserNode;
export const AudioBufferSourceNode = mod.AudioBufferSourceNode;
export const BiquadFilterNode = mod.BiquadFilterNode;
export const ChannelMergerNode = mod.ChannelMergerNode;
export const ChannelSplitterNode = mod.ChannelSplitterNode;
export const ConstantSourceNode = mod.ConstantSourceNode;
export const ConvolverNode = mod.ConvolverNode;
export const DelayNode = mod.DelayNode;
export const DynamicsCompressorNode = mod.DynamicsCompressorNode;
export const GainNode = mod.GainNode;
export const IIRFilterNode = mod.IIRFilterNode;
export const MediaStreamAudioSourceNode = mod.MediaStreamAudioSourceNode;
export const OscillatorNode = mod.OscillatorNode;
export const PannerNode = mod.PannerNode;
export const StereoPannerNode = mod.StereoPannerNode;
export const WaveShaperNode = mod.WaveShaperNode;

export const mediaDevices = mod.mediaDevices;

export default {
  OfflineAudioCompletionEvent: mod.OfflineAudioCompletionEvent,
  AudioProcessingEvent: mod.AudioProcessingEvent,
  AudioRenderCapacityEvent: mod.AudioRenderCapacityEvent,
  ErrorEvent: mod.ErrorEvent,
  AudioBuffer: mod.AudioBuffer,
  PeriodicWave: mod.PeriodicWave,
  AudioListener: mod.AudioListener,
  AudioDestinationNode: mod.AudioDestinationNode,
  AudioParamMap: mod.AudioParamMap,
  AudioPlaybackStats: mod.AudioPlaybackStats,
  AudioRenderCapacity: mod.AudioRenderCapacity,
  AudioScheduledSourceNode: mod.AudioScheduledSourceNode,
  AudioWorklet: mod.AudioWorklet,
  BaseAudioContext: mod.BaseAudioContext,
  AudioContext: mod.AudioContext,
  OfflineAudioContext: mod.OfflineAudioContext,
  // generated
  AudioParam: mod.AudioParam,
  AudioNode: mod.AudioNode,
  ScriptProcessorNode: mod.ScriptProcessorNode,
  AudioWorkletNode: mod.AudioWorkletNode,
  AnalyserNode: mod.AnalyserNode,
  AudioBufferSourceNode: mod.AudioBufferSourceNode,
  BiquadFilterNode: mod.BiquadFilterNode,
  ChannelMergerNode: mod.ChannelMergerNode,
  ChannelSplitterNode: mod.ChannelSplitterNode,
  ConstantSourceNode: mod.ConstantSourceNode,
  ConvolverNode: mod.ConvolverNode,
  DelayNode: mod.DelayNode,
  DynamicsCompressorNode: mod.DynamicsCompressorNode,
  GainNode: mod.GainNode,
  IIRFilterNode: mod.IIRFilterNode,
  MediaStreamAudioSourceNode: mod.MediaStreamAudioSourceNode,
  OscillatorNode: mod.OscillatorNode,
  PannerNode: mod.PannerNode,
  StereoPannerNode: mod.StereoPannerNode,
  WaveShaperNode: mod.WaveShaperNode,

  mediaDevices: mod.mediaDevices,
};
