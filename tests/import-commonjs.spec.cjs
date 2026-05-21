const { assert } =  require('chai');

const {
  OfflineAudioCompletionEvent,
  AudioProcessingEvent,
  AudioRenderCapacityEvent,
  ErrorEvent,
  BaseAudioContext,
  AudioContext,
  OfflineAudioContext,
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
  AudioNode,
  AudioScheduledSourceNode,
  AudioParam,
  AudioDestinationNode,
  AudioListener,
  AudioWorklet,
  AudioParamMap,
  AudioRenderCapacity,
  AudioPlaybackStats,
  PeriodicWave,
  AudioBuffer,
  mediaDevices,
} = require('../index.js');

const webaudio = require('../index.js');

describe('# commonjs', () => {
  it(`const { ... } = require('node-web-audio-api')`, () => {
    assert.isDefined(OfflineAudioCompletionEvent);
    assert.isDefined(AudioProcessingEvent);
    assert.isDefined(AudioRenderCapacityEvent);
    assert.isDefined(ErrorEvent);
    assert.isDefined(BaseAudioContext);
    assert.isDefined(AudioContext);
    assert.isDefined(OfflineAudioContext);
    assert.isDefined(ScriptProcessorNode);
    assert.isDefined(AudioWorkletNode);
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
    assert.isDefined(AudioNode);
    assert.isDefined(AudioScheduledSourceNode);
    assert.isDefined(AudioParam);
    assert.isDefined(AudioDestinationNode);
    assert.isDefined(AudioListener);
    assert.isDefined(AudioWorklet);
    assert.isDefined(AudioParamMap);
    assert.isDefined(AudioRenderCapacity);
    assert.isDefined(AudioPlaybackStats);
    assert.isDefined(PeriodicWave);
    assert.isDefined(AudioBuffer);
    assert.isDefined(mediaDevices);
  });

  it(`const webaudio = require('node-web-audio-api')`, () => {
    assert.isDefined(webaudio.OfflineAudioCompletionEvent);
    assert.isDefined(webaudio.AudioProcessingEvent);
    assert.isDefined(webaudio.AudioRenderCapacityEvent);
    assert.isDefined(webaudio.ErrorEvent);
    assert.isDefined(webaudio.BaseAudioContext);
    assert.isDefined(webaudio.AudioContext);
    assert.isDefined(webaudio.OfflineAudioContext);
    assert.isDefined(webaudio.ScriptProcessorNode);
    assert.isDefined(webaudio.AudioWorkletNode);
    assert.isDefined(webaudio.AnalyserNode);
    assert.isDefined(webaudio.AudioBufferSourceNode);
    assert.isDefined(webaudio.BiquadFilterNode);
    assert.isDefined(webaudio.ChannelMergerNode);
    assert.isDefined(webaudio.ChannelSplitterNode);
    assert.isDefined(webaudio.ConstantSourceNode);
    assert.isDefined(webaudio.ConvolverNode);
    assert.isDefined(webaudio.DelayNode);
    assert.isDefined(webaudio.DynamicsCompressorNode);
    assert.isDefined(webaudio.GainNode);
    assert.isDefined(webaudio.IIRFilterNode);
    assert.isDefined(webaudio.MediaStreamAudioSourceNode);
    assert.isDefined(webaudio.OscillatorNode);
    assert.isDefined(webaudio.PannerNode);
    assert.isDefined(webaudio.StereoPannerNode);
    assert.isDefined(webaudio.WaveShaperNode);
    assert.isDefined(webaudio.AudioNode);
    assert.isDefined(webaudio.AudioScheduledSourceNode);
    assert.isDefined(webaudio.AudioParam);
    assert.isDefined(webaudio.AudioDestinationNode);
    assert.isDefined(webaudio.AudioListener);
    assert.isDefined(webaudio.AudioWorklet);
    assert.isDefined(webaudio.AudioParamMap);
    assert.isDefined(webaudio.AudioRenderCapacity);
    assert.isDefined(webaudio.AudioPlaybackStats);
    assert.isDefined(webaudio.PeriodicWave);
    assert.isDefined(webaudio.AudioBuffer);
    assert.isDefined(webaudio.mediaDevices);
  });

  it(`all same references`, () => {
    assert.strictEqual(webaudio.OfflineAudioCompletionEvent, OfflineAudioCompletionEvent);
    assert.strictEqual(webaudio.AudioProcessingEvent, AudioProcessingEvent);
    assert.strictEqual(webaudio.AudioRenderCapacityEvent, AudioRenderCapacityEvent);
    assert.strictEqual(webaudio.ErrorEvent, ErrorEvent);
    assert.strictEqual(webaudio.BaseAudioContext, BaseAudioContext);
    assert.strictEqual(webaudio.AudioContext, AudioContext);
    assert.strictEqual(webaudio.OfflineAudioContext, OfflineAudioContext);
    assert.strictEqual(webaudio.ScriptProcessorNode, ScriptProcessorNode);
    assert.strictEqual(webaudio.AudioWorkletNode, AudioWorkletNode);
    assert.strictEqual(webaudio.AnalyserNode, AnalyserNode);
    assert.strictEqual(webaudio.AudioBufferSourceNode, AudioBufferSourceNode);
    assert.strictEqual(webaudio.BiquadFilterNode, BiquadFilterNode);
    assert.strictEqual(webaudio.ChannelMergerNode, ChannelMergerNode);
    assert.strictEqual(webaudio.ChannelSplitterNode, ChannelSplitterNode);
    assert.strictEqual(webaudio.ConstantSourceNode, ConstantSourceNode);
    assert.strictEqual(webaudio.ConvolverNode, ConvolverNode);
    assert.strictEqual(webaudio.DelayNode, DelayNode);
    assert.strictEqual(webaudio.DynamicsCompressorNode, DynamicsCompressorNode);
    assert.strictEqual(webaudio.GainNode, GainNode);
    assert.strictEqual(webaudio.IIRFilterNode, IIRFilterNode);
    assert.strictEqual(webaudio.MediaStreamAudioSourceNode, MediaStreamAudioSourceNode);
    assert.strictEqual(webaudio.OscillatorNode, OscillatorNode);
    assert.strictEqual(webaudio.PannerNode, PannerNode);
    assert.strictEqual(webaudio.StereoPannerNode, StereoPannerNode);
    assert.strictEqual(webaudio.WaveShaperNode, WaveShaperNode);
    assert.strictEqual(webaudio.AudioNode, AudioNode);
    assert.strictEqual(webaudio.AudioScheduledSourceNode, AudioScheduledSourceNode);
    assert.strictEqual(webaudio.AudioParam, AudioParam);
    assert.strictEqual(webaudio.AudioDestinationNode, AudioDestinationNode);
    assert.strictEqual(webaudio.AudioListener, AudioListener);
    assert.strictEqual(webaudio.AudioWorklet, AudioWorklet);
    assert.strictEqual(webaudio.AudioParamMap, AudioParamMap);
    assert.strictEqual(webaudio.AudioRenderCapacity, AudioRenderCapacity);
    assert.strictEqual(webaudio.AudioPlaybackStats, AudioPlaybackStats);
    assert.strictEqual(webaudio.PeriodicWave, PeriodicWave);
    assert.strictEqual(webaudio.AudioBuffer, AudioBuffer);
    assert.strictEqual(webaudio.mediaDevices, mediaDevices);
  });
});

