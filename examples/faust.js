// Requires: npm install @grame/faustwasm
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AudioContext, AudioWorkletNode } from '../index.mjs';
import {
  instantiateFaustModuleFromFile,
  LibFaust,
  FaustCompiler,
  FaustMonoDspGenerator,
} from '@grame/faustwasm/dist/esm/index.js';

// Ensure the AudioWorkletNode constructor is available globally for faustwasm.
if (typeof globalThis.AudioWorkletNode === 'undefined') {
  globalThis.AudioWorkletNode = AudioWorkletNode;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const faustWasmDir = path.resolve(__dirname, '../node_modules/@grame/faustwasm/libfaust-wasm');
const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const dspCode = `
import("stdfaust.lib");
process = os.osc(440);
`;

const faustModule = await instantiateFaustModuleFromFile(
  path.join(faustWasmDir, 'libfaust-wasm.js'),
  path.join(faustWasmDir, 'libfaust-wasm.data'),
  path.join(faustWasmDir, 'libfaust-wasm.wasm'),
);

const libFaust = new LibFaust(faustModule);
const compiler = new FaustCompiler(libFaust);
const generator = new FaustMonoDspGenerator();

const compiled = await generator.compile(compiler, 'faust-osc', dspCode, '-I libraries/');
if (!compiled) {
  throw new Error('Faust compilation failed');
}

const faustNode = await generator.createNode(audioContext, 'faust-osc', generator.factory, false);
if (!faustNode) {
  throw new Error('Failed to create Faust node');
}

console.log('Faust node created successfully.', faustNode);

//if (typeof faustNode.connect === 'function') {
  faustNode.connect(audioContext.destination);
//}

//if (typeof faustNode.start === 'function') {
  faustNode.start();
//}

await audioContext.resume();

console.log('Faust oscillator playing for 4 seconds...');
await new Promise(resolve => setTimeout(resolve, 4000));

faustNode.stop();
await audioContext.close();
