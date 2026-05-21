import {
  AudioContext,
  // ConstantSourceNode,
  OscillatorNode,
} from '#node-web-audio-api';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const src = new OscillatorNode(audioContext, { frequency: 200 });
// const src = new ConstantSourceNode(audioContext, { offset: 0.5 });
const scriptProcessor = audioContext.createScriptProcessor();

scriptProcessor.addEventListener('audioprocess', e => {
  // put noise in left channel
  const leftOutput = e.outputBuffer.getChannelData(0);

  for (let i = 0; i < leftOutput.length; i++) {
    leftOutput[i] = Math.random() * 2 - 1;
  }

  // propagate input to right channel
  const rightInput = e.inputBuffer.getChannelData(1);
  const rightOutput = e.outputBuffer.getChannelData(1);

  for (let i = 0; i < rightOutput.length; i++) {
    rightOutput[i] = rightInput[i];
  }
});

src
  .connect(scriptProcessor)
  .connect(audioContext.destination);

src.start();
