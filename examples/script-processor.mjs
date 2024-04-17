import { AudioContext, OscillatorNode, ScriptProcessorNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const sine = new OscillatorNode(audioContext);
sine.frequency.value = 200;
sine.connect(audioContext.destination);
sine.start();

const scriptProcessor = new ScriptProcessorNode(audioContext);
scriptProcessor.addEventListener('audioprocess', e => {
  console.log(e.playbackTime);
  console.log(e.inputBuffer);
  console.log(e.outputBuffer);
});
scriptProcessor.connect(audioContext.destination);

