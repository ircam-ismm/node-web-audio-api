import { AudioContext, OscillatorNode, GainNode, AudioWorkletNode } from '../index.mjs';

// load audio worklet from online source

const plugin = 'https://googlechromelabs.github.io/web-audio-samples/audio-worklet/basic/noise-generator/noise-generator.js';
const audioContext = new AudioContext();
await audioContext.audioWorklet.addModule(plugin);

const modulatorNode = new OscillatorNode(audioContext);
const modGainNode = new GainNode(audioContext);
const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
noiseGeneratorNode.connect(audioContext.destination);

// Connect the oscillator to 'amplitude' AudioParam.
const paramAmp = noiseGeneratorNode.parameters.get('amplitude');
modulatorNode.connect(modGainNode).connect(paramAmp);

modulatorNode.frequency.value = 0.5;
modGainNode.gain.value = 0.75;
modulatorNode.start();
