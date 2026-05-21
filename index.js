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

import {
  OfflineAudioCompletionEvent as _OfflineAudioCompletionEvent,
} from './js/Events.js';
import {
  AudioProcessingEvent as _AudioProcessingEvent,
} from './js/Events.js';
import {
  AudioRenderCapacityEvent as _AudioRenderCapacityEvent,
} from './js/Events.js';
import {
  ErrorEvent as _ErrorEvent,
} from './js/Events.js';

import {
  BaseAudioContext as _BaseAudioContext,
} from './js/BaseAudioContext.js';
import {
  AudioContext as _AudioContext,
} from './js/AudioContext.js';
import {
  OfflineAudioContext as _OfflineAudioContext,
} from './js/OfflineAudioContext.js';

import {
  AudioNode as _AudioNode,
} from './js/AudioNode.js';
import {
  AudioScheduledSourceNode as _AudioScheduledSourceNode,
} from './js/AudioScheduledSourceNode.js';
import {
  AudioParam as _AudioParam,
} from './js/AudioParam.js';
import {
  AudioDestinationNode as _AudioDestinationNode,
} from './js/AudioDestinationNode.js';
import {
  AudioListener as _AudioListener,
} from './js/AudioListener.js';
import {
  AudioWorklet as _AudioWorklet,
} from './js/AudioWorklet.js';
import {
  AudioParamMap as _AudioParamMap,
} from './js/AudioParamMap.js';
import {
  AudioRenderCapacity as _AudioRenderCapacity,
} from './js/AudioRenderCapacity.js';
import {
  AudioPlaybackStats as _AudioPlaybackStats,
} from './js/AudioPlaybackStats.js';

import {
  AudioBuffer as _AudioBuffer,
} from './js/AudioBuffer.js';
import {
  PeriodicWave as _PeriodicWave,
} from './js/PeriodicWave.js';

// audio nodes
import {
  ScriptProcessorNode as _ScriptProcessorNode,
} from './js/ScriptProcessorNode.js';
import {
  AudioWorkletNode as _AudioWorkletNode,
} from './js/AudioWorkletNode.js';
import {
  AnalyserNode as _AnalyserNode,
} from './js/AnalyserNode.js';
import {
  AudioBufferSourceNode as _AudioBufferSourceNode,
} from './js/AudioBufferSourceNode.js';
import {
  BiquadFilterNode as _BiquadFilterNode,
} from './js/BiquadFilterNode.js';
import {
  ChannelMergerNode as _ChannelMergerNode,
} from './js/ChannelMergerNode.js';
import {
  ChannelSplitterNode as _ChannelSplitterNode,
} from './js/ChannelSplitterNode.js';
import {
  ConstantSourceNode as _ConstantSourceNode,
} from './js/ConstantSourceNode.js';
import {
  ConvolverNode as _ConvolverNode,
} from './js/ConvolverNode.js';
import {
  DelayNode as _DelayNode,
} from './js/DelayNode.js';
import {
  DynamicsCompressorNode as _DynamicsCompressorNode,
} from './js/DynamicsCompressorNode.js';
import {
  GainNode as _GainNode,
} from './js/GainNode.js';
import {
  IIRFilterNode as _IIRFilterNode,
} from './js/IIRFilterNode.js';
import {
  MediaStreamAudioSourceNode as _MediaStreamAudioSourceNode,
} from './js/MediaStreamAudioSourceNode.js';
import {
  OscillatorNode as _OscillatorNode,
} from './js/OscillatorNode.js';
import {
  PannerNode as _PannerNode,
} from './js/PannerNode.js';
import {
  StereoPannerNode as _StereoPannerNode,
} from './js/StereoPannerNode.js';
import {
  WaveShaperNode as _WaveShaperNode,
} from './js/WaveShaperNode.js';

// promisify MediaDevices API
// @todo - to be handled on Rust side with Task
import nativeBinding from './load-native.js';
const _mediaDevices = {};

_mediaDevices.enumerateDevices = async function enumerateDevices() {
  const list = nativeBinding.napiEnumerateDevices();
  return Promise.resolve(list);
};

_mediaDevices.getUserMedia = async function getUserMedia(options) {
  if (options === undefined) {
    throw new TypeError('Failed to execute "getUserMedia" on "MediaDevices": audio must be requested');
  }

  const stream = nativeBinding.napiGetUserMedia(options);
  return Promise.resolve(stream);
};

export const OfflineAudioCompletionEvent = _OfflineAudioCompletionEvent;
export const AudioProcessingEvent = _AudioProcessingEvent;
export const AudioRenderCapacityEvent = _AudioRenderCapacityEvent;
export const ErrorEvent = _ErrorEvent;

export const BaseAudioContext = _BaseAudioContext;
export const AudioContext = _AudioContext;
export const OfflineAudioContext = _OfflineAudioContext;

export const AudioBuffer = _AudioBuffer;
export const PeriodicWave = _PeriodicWave;
export const AudioListener = _AudioListener;
export const AudioDestinationNode = _AudioDestinationNode;
export const AudioParamMap = _AudioParamMap;
export const AudioPlaybackStats = _AudioPlaybackStats;
export const AudioRenderCapacity = _AudioRenderCapacity;
export const AudioScheduledSourceNode = _AudioScheduledSourceNode;
export const AudioWorklet = _AudioWorklet;
// generated entities
export const AudioParam = _AudioParam;
export const AudioNode = _AudioNode;
// all audio nodes
export const ScriptProcessorNode = _ScriptProcessorNode;
export const AudioWorkletNode = _AudioWorkletNode;
export const AnalyserNode = _AnalyserNode;
export const AudioBufferSourceNode = _AudioBufferSourceNode;
export const BiquadFilterNode = _BiquadFilterNode;
export const ChannelMergerNode = _ChannelMergerNode;
export const ChannelSplitterNode = _ChannelSplitterNode;
export const ConstantSourceNode = _ConstantSourceNode;
export const ConvolverNode = _ConvolverNode;
export const DelayNode = _DelayNode;
export const DynamicsCompressorNode = _DynamicsCompressorNode;
export const GainNode = _GainNode;
export const IIRFilterNode = _IIRFilterNode;
export const MediaStreamAudioSourceNode = _MediaStreamAudioSourceNode;
export const OscillatorNode = _OscillatorNode;
export const PannerNode = _PannerNode;
export const StereoPannerNode = _StereoPannerNode;
export const WaveShaperNode = _WaveShaperNode;

export const mediaDevices = _mediaDevices;

export default {
  OfflineAudioCompletionEvent: _OfflineAudioCompletionEvent,
  AudioProcessingEvent: _AudioProcessingEvent,
  AudioRenderCapacityEvent: _AudioRenderCapacityEvent,
  ErrorEvent: _ErrorEvent,
  AudioBuffer: _AudioBuffer,
  PeriodicWave: _PeriodicWave,
  AudioListener: _AudioListener,
  AudioDestinationNode: _AudioDestinationNode,
  AudioParamMap: _AudioParamMap,
  AudioPlaybackStats: _AudioPlaybackStats,
  AudioRenderCapacity: _AudioRenderCapacity,
  AudioScheduledSourceNode: _AudioScheduledSourceNode,
  AudioWorklet: _AudioWorklet,
  BaseAudioContext: _BaseAudioContext,
  AudioContext: _AudioContext,
  OfflineAudioContext: _OfflineAudioContext,
  // generated
  AudioParam: _AudioParam,
  AudioNode: _AudioNode,
  ScriptProcessorNode: _ScriptProcessorNode,
  AudioWorkletNode: _AudioWorkletNode,
  AnalyserNode: _AnalyserNode,
  AudioBufferSourceNode: _AudioBufferSourceNode,
  BiquadFilterNode: _BiquadFilterNode,
  ChannelMergerNode: _ChannelMergerNode,
  ChannelSplitterNode: _ChannelSplitterNode,
  ConstantSourceNode: _ConstantSourceNode,
  ConvolverNode: _ConvolverNode,
  DelayNode: _DelayNode,
  DynamicsCompressorNode: _DynamicsCompressorNode,
  GainNode: _GainNode,
  IIRFilterNode: _IIRFilterNode,
  MediaStreamAudioSourceNode: _MediaStreamAudioSourceNode,
  OscillatorNode: _OscillatorNode,
  PannerNode: _PannerNode,
  StereoPannerNode: _StereoPannerNode,
  WaveShaperNode: _WaveShaperNode,

  mediaDevices: _mediaDevices,
};
