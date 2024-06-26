import { AudioContext, OscillatorNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const sine = new OscillatorNode(audioContext);
sine.frequency.value = 200;

const scriptProcessor = audioContext.createScriptProcessor();

scriptProcessor.addEventListener('audioprocess', e => {
  const input = e.inputBuffer.getChannelData(0);
  const output = e.outputBuffer.getChannelData(0);

  // should ear noise only on left channel
  for (let i = 0; i < output.length; i++) {
    output[i] = input[i] + Math.random() * 2 - 1;
  }
});

sine
  .connect(scriptProcessor)
  .connect(audioContext.destination);

sine.start();
