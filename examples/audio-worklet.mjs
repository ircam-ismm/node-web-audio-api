import { AudioContext, OscillatorNode, AudioWorkletNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const sine = new OscillatorNode(audioContext, { type: 'sawtooth', frequency: 5000 });
const bitCrusher = new AudioWorkletNode(audioContext, 'crush.js', { processorOptions: "hello world" });

sine
  .connect(bitCrusher)
  .connect(audioContext.destination);

const paramBitDepth =  bitCrusher.parameters.bitDepth;
const paramReduction =  bitCrusher.parameters.frequencyReduction;

paramBitDepth.setValueAtTime(1, 0);

paramReduction.setValueAtTime(0.01, 0.);
paramReduction.linearRampToValueAtTime(0.1, 4.);
paramReduction.exponentialRampToValueAtTime(0.01, 8.);

sine.start();
sine.stop(8);
