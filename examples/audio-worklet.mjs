import { AudioContext, AudioWorkletNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

/*
audioContext.addModule('noise.js');
*/

const node = new AudioWorkletNode(audioContext, 'noise.js', {processorOptions: "hello world"});
node.connect(audioContext.destination);
