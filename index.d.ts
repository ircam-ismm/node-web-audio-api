// Referencing the default lib web api typings
/// <reference lib="dom" />

declare module "node-web-audio-api" {
    export import AudioContext = globalThis.AudioContext;
    export import OfflineAudioContext = globalThis.OfflineAudioContext;
    export import AudioBuffer = globalThis.AudioBuffer;
    export import PeriodicWave = globalThis.PeriodicWave;
    export import MediaStreamAudioSourceNode = globalThis.MediaStreamAudioSourceNode;
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
    export import OscillatorNode = globalThis.OscillatorNode;
    export import PannerNode = globalThis.PannerNode;
    export import StereoPannerNode = globalThis.StereoPannerNode;
    export import WaveShaperNode = globalThis.WaveShaperNode;
}
