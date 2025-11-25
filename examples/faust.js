

// Example: run a simple Faust oscillator graph using node-web-audio-api.
// Requires: npm install @grame/faustwasm
// Usage: node faust.js

import { fileURLToPath } from 'node:url';
import { AudioContext, AudioWorkletNode } from '../index.mjs';

// Expose AudioWorkletNode globally so faustwasm can patch it into worklet factories.
if (typeof globalThis.AudioWorkletNode === 'undefined') {
  globalThis.AudioWorkletNode = AudioWorkletNode;
}

const {
  instantiateFaustModuleFromFile,
  LibFaust,
  FaustCompiler,
  FaustMonoDspGenerator,
} = await import('@grame/faustwasm/dist/esm/index.js');

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

// Minimal Faust DSP: two sine oscillators mixed to stereo.
const dspCode = `
import("stdfaust.lib");
process = os.osc(440)*0.3, os.osc(800)*0.3;
`;

// Load the Faust toolchain from the wasm distribution.
const faustModule = await instantiateFaustModuleFromFile(
  fileURLToPath(import.meta.resolve('@grame/faustwasm/libfaust-wasm/libfaust-wasm.js')),
  fileURLToPath(import.meta.resolve('@grame/faustwasm/libfaust-wasm/libfaust-wasm.data')),
  fileURLToPath(import.meta.resolve('@grame/faustwasm/libfaust-wasm/libfaust-wasm.wasm')),
);

const libFaust = new LibFaust(faustModule);
const compiler = new FaustCompiler(libFaust);
const generator = new FaustMonoDspGenerator();

const compiled = await generator.compile(compiler, 'faust-osc', dspCode, '-ftz 2');
if (!compiled) {
  throw new Error('Faust compilation failed');
}

const faustNode = await generator.createNode(audioContext);
if (!faustNode) {
  throw new Error('Failed to create Faust node');
}

console.log('Faust node created successfully.', faustNode);

faustNode.connect(audioContext.destination);
faustNode.start();

console.log('Faust oscillator playing for 4 seconds...');
await new Promise(resolve => setTimeout(resolve, 4000));

faustNode.stop();
await audioContext.close();
