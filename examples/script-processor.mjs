import { AudioContext, GainNode, OscillatorNode, ScriptProcessorNode } from '../index.mjs';
import { kNapiObj } from '../js/lib/symbols.js'

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const sine = new OscillatorNode(audioContext);
sine.frequency.value = 200;
sine.start();

const gain = new GainNode(audioContext);

const scriptProcessor = new ScriptProcessorNode(audioContext);
const buffer = new Float32Array(scriptProcessor.bufferSize);
scriptProcessor.addEventListener('audioprocess', e => {
  e.inputBuffer.copyFromChannel(buffer, 0);
  // add noise
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] += Math.random() * 2 - 1;
  }

  e.outputBuffer.copyToChannel(buffer, 0);
});

sine
  .connect(scriptProcessor)
  .connect(audioContext.destination);

