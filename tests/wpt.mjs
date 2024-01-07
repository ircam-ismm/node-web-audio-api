import { AnalyserNode, AudioContext, GainNode, OfflineAudioContext, mediaDevices } from '../index.mjs';

const audioContext = new OfflineAudioContext(2, 1, 48000);

const src = audioContext.createBufferSource();
src.start(NaN);
