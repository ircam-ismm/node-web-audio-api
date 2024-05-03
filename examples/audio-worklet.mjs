import { AudioContext, OscillatorNode, AudioWorkletNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const sine = new OscillatorNode(audioContext);
sine.frequency.value = 200;

/*
audioContext.addModule('noise.js');
*/

const node = new AudioWorkletNode(audioContext, 'crush.js', {processorOptions: "hello world"});

sine
  .connect(node)
  .connect(audioContext.destination);

sine.start();
