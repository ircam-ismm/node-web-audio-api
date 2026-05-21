import { assert } from 'chai';

import {
  //
  OfflineAudioCompletionEvent,
  AudioProcessingEvent,
  AudioRenderCapacityEvent,
  ErrorEvent,
  AudioBuffer,
  PeriodicWave,
  AudioListener,
  AudioDestinationNode,
  AudioParamMap,
  AudioPlaybackStats,
  AudioRenderCapacity,
  AudioScheduledSourceNode,
  AudioWorklet,
  BaseAudioContext,
  AudioContext,
  OfflineAudioContext,
  AudioParam,
  AudioNode,

  AudioWorkletNode,
  ScriptProcessorNode,
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

} from '../index.js';

// support namespace export
import * as webaudioNamespace from '../index.js';
// support export default
import webaudioDefault from '../index.js';

describe('should properly support module syntax', () => {
  it(`import {...} from 'node-web-audio-api`, () => {
    assert.isDefined(OfflineAudioCompletionEvent);
    assert.isDefined(AudioProcessingEvent);
    assert.isDefined(AudioRenderCapacityEvent);
    assert.isDefined(ErrorEvent);
    assert.isDefined(AudioBuffer);
    assert.isDefined(PeriodicWave);
    assert.isDefined(AudioParam);
    assert.isDefined(AudioListener);
    assert.isDefined(AudioNode);
    assert.isDefined(AudioDestinationNode);
    assert.isDefined(AudioParamMap);
    assert.isDefined(AudioPlaybackStats);
    assert.isDefined(AudioRenderCapacity);
    assert.isDefined(AudioScheduledSourceNode);
    assert.isDefined(AudioWorklet);
    assert.isDefined(BaseAudioContext);
    assert.isDefined(AudioContext);
    assert.isDefined(OfflineAudioContext);
    assert.isDefined(AudioWorkletNode);
    assert.isDefined(ScriptProcessorNode);
    assert.isDefined(AnalyserNode);
    assert.isDefined(AudioBufferSourceNode);
    assert.isDefined(BiquadFilterNode);
    assert.isDefined(ChannelMergerNode);
    assert.isDefined(ChannelSplitterNode);
    assert.isDefined(ConstantSourceNode);
    assert.isDefined(ConvolverNode);
    assert.isDefined(DelayNode);
    assert.isDefined(DynamicsCompressorNode);
    assert.isDefined(GainNode);
    assert.isDefined(IIRFilterNode);
    assert.isDefined(MediaStreamAudioSourceNode);
    assert.isDefined(OscillatorNode);
    assert.isDefined(PannerNode);
    assert.isDefined(StereoPannerNode);
    assert.isDefined(WaveShaperNode);
  });

  it(`import * as webaudio from 'node-web-audio-api`, () => {
    assert.isDefined(webaudioNamespace.OfflineAudioCompletionEvent);
    assert.isDefined(webaudioNamespace.AudioProcessingEvent);
    assert.isDefined(webaudioNamespace.AudioRenderCapacityEvent);
    assert.isDefined(webaudioNamespace.ErrorEvent);
    assert.isDefined(webaudioNamespace.AudioBuffer);
    assert.isDefined(webaudioNamespace.PeriodicWave);
    assert.isDefined(webaudioNamespace.AudioParam);
    assert.isDefined(webaudioNamespace.AudioListener);
    assert.isDefined(webaudioNamespace.AudioNode);
    assert.isDefined(webaudioNamespace.AudioDestinationNode);
    assert.isDefined(webaudioNamespace.AudioParamMap);
    assert.isDefined(webaudioNamespace.AudioPlaybackStats);
    assert.isDefined(webaudioNamespace.AudioRenderCapacity);
    assert.isDefined(webaudioNamespace.AudioScheduledSourceNode);
    assert.isDefined(webaudioNamespace.AudioWorklet);
    assert.isDefined(webaudioNamespace.BaseAudioContext);
    assert.isDefined(webaudioNamespace.AudioContext);
    assert.isDefined(webaudioNamespace.OfflineAudioContext);
    assert.isDefined(webaudioNamespace.ScriptProcessorNode);
    assert.isDefined(webaudioNamespace.AudioWorkletNode);
    assert.isDefined(webaudioNamespace.AnalyserNode);
    assert.isDefined(webaudioNamespace.AudioBufferSourceNode);
    assert.isDefined(webaudioNamespace.BiquadFilterNode);
    assert.isDefined(webaudioNamespace.ChannelMergerNode);
    assert.isDefined(webaudioNamespace.ChannelSplitterNode);
    assert.isDefined(webaudioNamespace.ConstantSourceNode);
    assert.isDefined(webaudioNamespace.ConvolverNode);
    assert.isDefined(webaudioNamespace.DelayNode);
    assert.isDefined(webaudioNamespace.DynamicsCompressorNode);
    assert.isDefined(webaudioNamespace.GainNode);
    assert.isDefined(webaudioNamespace.IIRFilterNode);
    assert.isDefined(webaudioNamespace.MediaStreamAudioSourceNode);
    assert.isDefined(webaudioNamespace.OscillatorNode);
    assert.isDefined(webaudioNamespace.PannerNode);
    assert.isDefined(webaudioNamespace.StereoPannerNode);
    assert.isDefined(webaudioNamespace.WaveShaperNode);
  });

  it(`import webaudio from 'node-web-audio-api`, () => {
    assert.isDefined(webaudioDefault.OfflineAudioCompletionEvent);
    assert.isDefined(webaudioDefault.AudioProcessingEvent);
    assert.isDefined(webaudioDefault.AudioRenderCapacityEvent);
    assert.isDefined(webaudioDefault.ErrorEvent);
    assert.isDefined(webaudioDefault.AudioBuffer);
    assert.isDefined(webaudioDefault.PeriodicWave);
    assert.isDefined(webaudioDefault.AudioParam);
    assert.isDefined(webaudioDefault.AudioListener);
    assert.isDefined(webaudioDefault.AudioNode);
    assert.isDefined(webaudioDefault.AudioDestinationNode);
    assert.isDefined(webaudioDefault.AudioParamMap);
    assert.isDefined(webaudioDefault.AudioPlaybackStats);
    assert.isDefined(webaudioDefault.AudioRenderCapacity);
    assert.isDefined(webaudioDefault.AudioScheduledSourceNode);
    assert.isDefined(webaudioDefault.AudioWorklet);
    assert.isDefined(webaudioDefault.BaseAudioContext);
    assert.isDefined(webaudioDefault.AudioContext);
    assert.isDefined(webaudioDefault.OfflineAudioContext);
    assert.isDefined(webaudioDefault.AudioWorkletNode);
    assert.isDefined(webaudioDefault.ScriptProcessorNode);
    assert.isDefined(webaudioDefault.AnalyserNode);
    assert.isDefined(webaudioDefault.AudioBufferSourceNode);
    assert.isDefined(webaudioDefault.BiquadFilterNode);
    assert.isDefined(webaudioDefault.ChannelMergerNode);
    assert.isDefined(webaudioDefault.ChannelSplitterNode);
    assert.isDefined(webaudioDefault.ConstantSourceNode);
    assert.isDefined(webaudioDefault.ConvolverNode);
    assert.isDefined(webaudioDefault.DelayNode);
    assert.isDefined(webaudioDefault.DynamicsCompressorNode);
    assert.isDefined(webaudioDefault.GainNode);
    assert.isDefined(webaudioDefault.IIRFilterNode);
    assert.isDefined(webaudioDefault.MediaStreamAudioSourceNode);
    assert.isDefined(webaudioDefault.OscillatorNode);
    assert.isDefined(webaudioDefault.PannerNode);
    assert.isDefined(webaudioDefault.StereoPannerNode);
    assert.isDefined(webaudioDefault.WaveShaperNode);
  });

  it(`all same references`, () => {
    assert.deepEqual(OfflineAudioCompletionEvent, webaudioNamespace.OfflineAudioCompletionEvent);
    assert.deepEqual(AudioProcessingEvent, webaudioNamespace.AudioProcessingEvent);
    assert.deepEqual(AudioRenderCapacityEvent, webaudioNamespace.AudioRenderCapacityEvent);
    assert.deepEqual(ErrorEvent, webaudioNamespace.ErrorEvent);
    assert.deepEqual(AudioBuffer, webaudioNamespace.AudioBuffer);
    assert.deepEqual(PeriodicWave, webaudioNamespace.PeriodicWave);
    assert.deepEqual(AudioParam, webaudioNamespace.AudioParam);
    assert.deepEqual(AudioListener, webaudioNamespace.AudioListener);
    assert.deepEqual(AudioNode, webaudioNamespace.AudioNode);
    assert.deepEqual(AudioDestinationNode, webaudioNamespace.AudioDestinationNode);
    assert.deepEqual(AudioParamMap, webaudioNamespace.AudioParamMap);
    assert.deepEqual(AudioPlaybackStats, webaudioNamespace.AudioPlaybackStats);
    assert.deepEqual(AudioRenderCapacity, webaudioNamespace.AudioRenderCapacity);
    assert.deepEqual(AudioScheduledSourceNode, webaudioNamespace.AudioScheduledSourceNode);
    assert.deepEqual(AudioWorklet, webaudioNamespace.AudioWorklet);
    assert.deepEqual(BaseAudioContext, webaudioNamespace.BaseAudioContext);
    assert.deepEqual(AudioContext, webaudioNamespace.AudioContext);
    assert.deepEqual(OfflineAudioContext, webaudioNamespace.OfflineAudioContext);
    assert.deepEqual(AudioWorkletNode, webaudioNamespace.AudioWorkletNode);
    assert.deepEqual(ScriptProcessorNode, webaudioNamespace.ScriptProcessorNode);
    assert.deepEqual(AnalyserNode, webaudioNamespace.AnalyserNode);
    assert.deepEqual(AudioBufferSourceNode, webaudioNamespace.AudioBufferSourceNode);
    assert.deepEqual(BiquadFilterNode, webaudioNamespace.BiquadFilterNode);
    assert.deepEqual(ChannelMergerNode, webaudioNamespace.ChannelMergerNode);
    assert.deepEqual(ChannelSplitterNode, webaudioNamespace.ChannelSplitterNode);
    assert.deepEqual(ConstantSourceNode, webaudioNamespace.ConstantSourceNode);
    assert.deepEqual(ConvolverNode, webaudioNamespace.ConvolverNode);
    assert.deepEqual(DelayNode, webaudioNamespace.DelayNode);
    assert.deepEqual(DynamicsCompressorNode, webaudioNamespace.DynamicsCompressorNode);
    assert.deepEqual(GainNode, webaudioNamespace.GainNode);
    assert.deepEqual(IIRFilterNode, webaudioNamespace.IIRFilterNode);
    assert.deepEqual(MediaStreamAudioSourceNode, webaudioNamespace.MediaStreamAudioSourceNode);
    assert.deepEqual(OscillatorNode, webaudioNamespace.OscillatorNode);
    assert.deepEqual(PannerNode, webaudioNamespace.PannerNode);
    assert.deepEqual(StereoPannerNode, webaudioNamespace.StereoPannerNode);
    assert.deepEqual(WaveShaperNode, webaudioNamespace.WaveShaperNode);

    assert.deepEqual(OfflineAudioCompletionEvent, webaudioDefault.OfflineAudioCompletionEvent);
    assert.deepEqual(AudioProcessingEvent, webaudioDefault.AudioProcessingEvent);
    assert.deepEqual(AudioRenderCapacityEvent, webaudioDefault.AudioRenderCapacityEvent);
    assert.deepEqual(ErrorEvent, webaudioDefault.ErrorEvent);
    assert.deepEqual(AudioBuffer, webaudioDefault.AudioBuffer);
    assert.deepEqual(PeriodicWave, webaudioDefault.PeriodicWave);
    assert.deepEqual(AudioParam, webaudioDefault.AudioParam);
    assert.deepEqual(AudioListener, webaudioDefault.AudioListener);
    assert.deepEqual(AudioNode, webaudioDefault.AudioNode);
    assert.deepEqual(AudioDestinationNode, webaudioDefault.AudioDestinationNode);
    assert.deepEqual(AudioParamMap, webaudioDefault.AudioParamMap);
    assert.deepEqual(AudioPlaybackStats, webaudioDefault.AudioPlaybackStats);
    assert.deepEqual(AudioRenderCapacity, webaudioDefault.AudioRenderCapacity);
    assert.deepEqual(AudioScheduledSourceNode, webaudioDefault.AudioScheduledSourceNode);
    assert.deepEqual(AudioWorklet, webaudioDefault.AudioWorklet);
    assert.deepEqual(BaseAudioContext, webaudioDefault.BaseAudioContext);
    assert.deepEqual(AudioContext, webaudioDefault.AudioContext);
    assert.deepEqual(OfflineAudioContext, webaudioDefault.OfflineAudioContext);
    assert.deepEqual(AudioWorkletNode, webaudioDefault.AudioWorkletNode);
    assert.deepEqual(ScriptProcessorNode, webaudioDefault.ScriptProcessorNode);
    assert.deepEqual(AnalyserNode, webaudioDefault.AnalyserNode);
    assert.deepEqual(AudioBufferSourceNode, webaudioDefault.AudioBufferSourceNode);
    assert.deepEqual(BiquadFilterNode, webaudioDefault.BiquadFilterNode);
    assert.deepEqual(ChannelMergerNode, webaudioDefault.ChannelMergerNode);
    assert.deepEqual(ChannelSplitterNode, webaudioDefault.ChannelSplitterNode);
    assert.deepEqual(ConstantSourceNode, webaudioDefault.ConstantSourceNode);
    assert.deepEqual(ConvolverNode, webaudioDefault.ConvolverNode);
    assert.deepEqual(DelayNode, webaudioDefault.DelayNode);
    assert.deepEqual(DynamicsCompressorNode, webaudioDefault.DynamicsCompressorNode);
    assert.deepEqual(GainNode, webaudioDefault.GainNode);
    assert.deepEqual(IIRFilterNode, webaudioDefault.IIRFilterNode);
    assert.deepEqual(MediaStreamAudioSourceNode, webaudioDefault.MediaStreamAudioSourceNode);
    assert.deepEqual(OscillatorNode, webaudioDefault.OscillatorNode);
    assert.deepEqual(PannerNode, webaudioDefault.PannerNode);
    assert.deepEqual(StereoPannerNode, webaudioDefault.StereoPannerNode);
    assert.deepEqual(WaveShaperNode, webaudioDefault.WaveShaperNode);
  });
})
