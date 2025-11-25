// Example: French church bell physical model with parameter tweaks.
// Source DSP: https://faustdoc.grame.fr/examples/physicalModeling/#frenchbell
// Requires: npm install @grame/faustwasm
// Usage: node faust-bell.js

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

// French bell physical model with the stock UI (strike position, cutoff, sharpness, gain, gate)
// plus a stereo freeverb tail with mix/feedback/damping controls.
const dspCode = `
declare name "FrenchChurchBell";
declare description "French church bell physical model.";
declare license "MIT";
declare copyright "(c)Romain Michon, CCRMA (Stanford University), GRAME";

import("stdfaust.lib");

mix = hslider("reverb/[0]mix", 0.3, 0, 1, 0.01);
fb1 = hslider("reverb/[1]feedback1", 0.7, 0, 0.95, 0.01);
fb2 = hslider("reverb/[2]feedback2", 0.5, 0, 0.95, 0.01);
damp = hslider("reverb/[3]damp", 0.3, 0, 1, 0.01);
spread = hslider("reverb/[4]spread[samp]", 30, 0, 80, 1);

dryWet(mix, fx) = (_,_) <: (_,_),fx : *(1-mix), *(1-mix), *(mix), *(mix) : +, +;

// The bell UI is mono; duplicate to stereo before the wet/dry split.
process = pm.frenchBell_ui <: dryWet(mix, re.stereo_freeverb(fb1, fb2, damp, spread));
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

const compiled = await generator.compile(compiler, 'faust-bell', dspCode, '-I libraries/');
if (!compiled) {
  throw new Error('Faust compilation failed');
}

const faustNode = await generator.createNode(audioContext, 'faust-bell', generator.factory, false);
if (!faustNode) {
  throw new Error('Failed to create Faust bell node');
}

console.log('Faust bell node created.', faustNode);

faustNode.connect(audioContext.destination);
faustNode.start();

// Gather parameters from the compiled UI and prepare helpers.
const params = faustNode.getParams?.() ?? [];
console.log('Available parameters:', params);

// Find the first parameter path that contains all substrings (case-insensitive).
const findParam = substrings => {
  const match = params.find(p => {
    const low = p.toLowerCase();
    return substrings.every(s => low.includes(s));
  });
  if (!match) throw new Error(`Parameter containing "${substrings.join(' & ')}" not found`);
  return match;
};

const set = (name, value) => {
  faustNode.setParamValue(name, value);
  console.log(`Set ${name} -> ${value}`);
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Map important controls.
const strikePosition = findParam(['strikeposition']);   // 0..6 (higher = nearer to rim)
const strikeCutoff = findParam(['strikecutoff']);       // Hz
const strikeSharpness = findParam(['strikesharpness']); // 0.01..5
const gain = findParam(['gain']);                       // 0..1
const gate = findParam(['gate']);                       // trigger (button)

const rvMix = findParam(['reverb', 'mix']);
const rvFb1 = findParam(['reverb', 'feedback1']);
const rvFb2 = findParam(['reverb', 'feedback2']);
const rvDamp = findParam(['reverb', 'damp']);
const rvSpread = findParam(['reverb', 'spread']);

// Strike helper: short pulse on the gate param.
const strike = async () => {
  set(gate, 1);
  await sleep(40);
  set(gate, 0);
};

// Initialize to a mellow strike.
set(strikePosition, 2); // toward the waist
set(strikeCutoff, 6500);
set(strikeSharpness, 0.6);
set(gain, 0.7);
set(rvMix, 0.35);
set(rvFb1, 0.7);
set(rvFb2, 0.5);
set(rvDamp, 0.35);
set(rvSpread, 35);

console.log('Playing bell variations...');
await strike();

await sleep(3500);
set(strikePosition, 4); // closer to the rim, brighter partials
set(strikeCutoff, 9000);
set(strikeSharpness, 1.2);
set(gain, 0.9);
set(rvMix, 0.5);
set(rvDamp, 0.25);
set(rvSpread, 45);
await strike();

await sleep(3500);
set(strikePosition, 1); // nearer the crown, darker tone
set(strikeCutoff, 4500);
set(strikeSharpness, 0.4);
set(gain, 0.6);
set(rvMix, 0.42);
set(rvFb1, 0.78);
set(rvFb2, 0.55);
set(rvDamp, 0.55);
set(rvSpread, 55);
await strike();

await sleep(2500);
console.log('Stopping...');

faustNode.stop();
await audioContext.close();
