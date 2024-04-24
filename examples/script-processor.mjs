import { AudioContext, AudioWorkletNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const node = new AudioWorkletNode(audioContext, 'white-noise');

node.addEventListener('audioprocess', e => {
  const input = e.inputBuffer.getChannelData(0);
  const output = e.outputBuffer.getChannelData(0);

  // should ear noise only on left channel
  for (let i = 0; i < output.length; i++) {
    output[i] = input[i] + Math.random() * 2 - 1;
  }
});

node.connect(audioContext.destination);
