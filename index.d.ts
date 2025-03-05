// Referencing the default lib web api typings
/// <reference lib="dom" />
declare module "node-web-audio-api" {
  export import OfflineAudioCompletionEvent = globalThis.OfflineAudioCompletionEvent;
  export import AudioProcessingEvent = globalThis.AudioProcessingEvent;

  export import BaseAudioContext = globalThis.BaseAudioContext;
  export import AudioContext = globalThis.AudioContext;
  export import OfflineAudioContext = globalThis.OfflineAudioContext;

  export import AudioNode = globalThis.AudioNode;
  export import AudioScheduledSourceNode = globalThis.AudioScheduledSourceNode;
  export import AudioParam = globalThis.AudioParam;
  export import AudioDestinationNode = globalThis.AudioDestinationNode;
  export import AudioListener = globalThis.AudioListener;
  export import AudioWorklet = globalThis.AudioWorklet;
  export import AudioParamMap = globalThis.AudioParamMap;

  export import PeriodicWave = globalThis.PeriodicWave;
  export import AudioBuffer = globalThis.AudioBuffer;
  export import AudioWorkletNode = globalThis.AudioWorkletNode;
  export import AnalyserNode = globalThis.AnalyserNode;
  export import AudioBufferSourceNode = globalThis.AudioBufferSourceNode;
  export import BiquadFilterNode = globalThis.BiquadFilterNode;
  export import ChannelMergerNode = globalThis.ChannelMergerNode;
  export import ChannelSplitterNode = globalThis.ChannelSplitterNode;
  export import ConstantSourceNode = globalThis.ConstantSourceNode;
  export import ConvolverNode = globalThis.ConvolverNode;
  export import DelayNode = globalThis.DelayNode;
  export import DynamicsCompressorNode = globalThis.DynamicsCompressorNode;
  export import GainNode = globalThis.GainNode;
  export import IIRFilterNode = globalThis.IIRFilterNode;
  export import MediaStreamAudioSourceNode = globalThis.MediaStreamAudioSourceNode;
  export import OscillatorNode = globalThis.OscillatorNode;
  export import PannerNode = globalThis.PannerNode;
  export import StereoPannerNode = globalThis.StereoPannerNode;
  export import WaveShaperNode = globalThis.WaveShaperNode;
}
