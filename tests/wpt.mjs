import { AudioBufferSourceNode, AnalyserNode, AudioContext, GainNode, OfflineAudioContext, StereoPannerNode, mediaDevices } from '../index.mjs';

const context = new OfflineAudioContext(2, 1, 48000);
// const node = new AudioBufferSourceNode(context, 42)
// const src = context.createBufferSource();
// src.start(NaN);
new StereoPannerNode(context, {"channelCountMode":"max"});
new StereoPannerNode(context, {"channelCount":3})
