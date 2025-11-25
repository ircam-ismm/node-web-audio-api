// Example: Faust DSP with parameters and runtime tweaks using node-web-audio-api.
// Requires: npm install @grame/faustwasm
// Usage: node faust-params.js

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

const audioContext = new AudioContext({ latencyHint: 'interactive' });

// Stereo tone with controllable gain, pitch and filter cutoff.
const dspCode = `
import("stdfaust.lib");

gain = hslider("gain[dB]", -6, -24, 6, 0.1) : ba.db2linear;
freq = hslider("freq[Hz]", 220, 50, 2000, 1);
cutoff = hslider("cutoff[Hz]", 800, 200, 4000, 1);

process = vgroup("faust-params",
  os.osc(freq) * gain : fi.lowpass(2, cutoff)
) <: _,_;
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

const compiled = await generator.compile(compiler, 'faust-params', dspCode, '-ftz 2');
if (!compiled) {
  throw new Error('Faust compilation failed');
}

const faustNode = await generator.createNode(audioContext);
if (!faustNode) {
  throw new Error('Failed to create Faust node');
}

console.log('Faust parameterized node created.', faustNode);

faustNode.connect(audioContext.destination);
faustNode.start();

// Helpers to inspect and tweak parameters. The parameter names come from the Faust UI paths.
const params = faustNode.getParams?.() ?? [];
console.log('Available parameters:', params);

const set = (name, value) => {
  faustNode.setParamValue(name, value);
  console.log(`Set ${name} -> ${value}`);
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Parameter automation demo.
set('/faust-params/gain', -12);
set('/faust-params/freq', 220);
set('/faust-params/cutoff', 800);
set('/faust-params/resonance', 0.9);

console.log('Sweeping parameters for 6 seconds...');
await sleep(1500);
set('/faust-params/freq', 440);
set('/faust-params/cutoff', 1200);

await sleep(1500);
set('/faust-params/gain', -3);
set('/faust-params/resonance', 1.8);

await sleep(1500);
set('/faust-params/freq', 660);
set('/faust-params/cutoff', 1800);

await sleep(1500);
console.log('Stopping...');

faustNode.stop();
await audioContext.close();
