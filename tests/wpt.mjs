import { AudioBufferSourceNode, AnalyserNode, AudioContext, GainNode, OfflineAudioContext, mediaDevices } from '../index.mjs';

const context = new OfflineAudioContext(2, 1, 48000);
const node = new AudioBufferSourceNode(context, 42)
// const src = context.createBufferSource();
// src.start(NaN);
