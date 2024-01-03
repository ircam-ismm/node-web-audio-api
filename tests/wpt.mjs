import { AnalyserNode, AudioContext, OfflineAudioContext, mediaDevices } from '../index.mjs';

const audioContext = new OfflineAudioContext(1, 1, 48000);
const node = new AnalyserNode(1);
