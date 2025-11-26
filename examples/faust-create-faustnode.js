// Node demo for the `createFaustNode` convenience helper.
// Requires: npm install @grame/faustwasm
// Usage: node examples/faust-create-faustnode.js

import { fileURLToPath } from 'node:url';
import { AudioContext, AudioWorkletNode, ScriptProcessorNode } from '../index.mjs';

// faustwasm captures AudioWorkletNode at module init, so patch the global first.
if (typeof globalThis.AudioWorkletNode === 'undefined') {
  globalThis.AudioWorkletNode = AudioWorkletNode;
}
if (typeof globalThis.ScriptProcessorNode === 'undefined') {
  globalThis.ScriptProcessorNode = ScriptProcessorNode;
}

const {
  instantiateFaustModuleFromFile,
  LibFaust,
  FaustCompiler,
  FaustDspGenerator,
} = await import('@grame/faustwasm/dist/esm/index.js');

// Pre-seed the compiler promise so createFaustNode works in Node (no window/document).
const libfaustJs = fileURLToPath(
  import.meta.resolve('@grame/faustwasm/libfaust-wasm/libfaust-wasm.js'),
);
const libfaustData = libfaustJs.replace(/c?js$/, 'data');
const libfaustWasm = libfaustJs.replace(/c?js$/, 'wasm');

FaustDspGenerator.compilerPromise ??= instantiateFaustModuleFromFile(
  libfaustJs,
  libfaustData,
  libfaustWasm,
).then((module) => new FaustCompiler(new LibFaust(module)));

const monoCode = `
import("stdfaust.lib");
process = os.osc(220) * 0.05;
`;

const polyCode = `
declare options "[nvoices:4][midi:on]";
import("stdfaust.lib");
freq = hslider("freq", 440, 50, 2000, 1);
gain = hslider("gain", 0.5, 0, 1, 0.01);
gate = button("gate");
process = gain * os.osc(freq) * gate;
`;

const polyEffectCode = `
declare options "[nvoices:4][midi:on]";
import("stdfaust.lib");
process = pm.clarinet_ui_MIDI <: dm.zita_light;
`;

const audioContext = new AudioContext({ latencyHint: 'interactive' });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runMonoPolyTest(modeLabel, sp = false, bufferSize) {
  if (sp && typeof audioContext.createScriptProcessor !== 'function') {
    console.warn('[faust]', 'ScriptProcessor not supported; skipping test');
    return;
  }

  const log = (...args) => console.log('[faust]', ...args);
  const error = (...args) => console.error('[faust]', ...args);

  try {
    log(`Starting ${modeLabel} mono test for 5 seconds…`);
    const monoGenerator = new FaustDspGenerator();
    const monoNode = await monoGenerator.createFaustNode(
      audioContext,
      `${modeLabel}_mono_test`,
      monoCode,
      sp,
      bufferSize,
    );
    if (!monoNode) {
      error(`${modeLabel} mono createFaustNode failed`);
      return;
    }
    monoNode.connect(audioContext.destination);
    log(
      `${modeLabel} mono running; inputs/outputs =`,
      monoNode.numberOfInputs,
      monoNode.numberOfOutputs,
    );

    await wait(5000);
    monoNode.disconnect();
    log(`${modeLabel} mono stopped after 5 seconds; starting poly test…`);

    const polyGenerator = new FaustDspGenerator();
    const polyNode = await polyGenerator.createFaustNode(
      audioContext,
      `${modeLabel}_poly_test`,
      polyCode,
      sp,
      bufferSize,
    );
    if (!polyNode) {
      error(`${modeLabel} poly createFaustNode failed`);
      return;
    }
    polyNode.connect(audioContext.destination);
    log(
      `${modeLabel} poly running; inputs/outputs =`,
      polyNode.numberOfInputs,
      polyNode.numberOfOutputs,
    );

    const noteSeq = [
      { note: 60, vel: 100, dur: 500 },
      { note: 64, vel: 100, dur: 500 },
      { note: 67, vel: 100, dur: 500 },
    ];
    for (const { note, vel, dur } of noteSeq) {
      log(`${modeLabel} poly keyOn note ${note}`);
      polyNode.keyOn(0, note, vel);
      await wait(dur);
      polyNode.keyOff(0, note, 0);
      log(`${modeLabel} poly keyOff note ${note}`);
      await wait(100);
    }

    const chord = [60, 64, 67];
    log(`${modeLabel} poly chord on (C major)`);
    chord.forEach((n) => polyNode.keyOn(0, n, 100));
    await wait(2000);
    chord.forEach((n) => polyNode.keyOff(0, n, 0));
    log(`${modeLabel} poly chord off`);
    polyNode.disconnect();
    log(`${modeLabel} poly stopped`);
  } catch (e) {
    error(`${modeLabel} test error:`, e);
  }
}

async function runPolyEffectTest(modeLabel, sp = false, bufferSize) {
  if (sp && typeof audioContext.createScriptProcessor !== 'function') {
    console.warn('[faust]', 'ScriptProcessor not supported; skipping test');
    return;
  }

  const log = (...args) => console.log('[faust]', ...args);
  const error = (...args) => console.error('[faust]', ...args);

  try {
    log(`Starting ${modeLabel} poly+effect test…`);
    const generator = new FaustDspGenerator();
    const node = await generator.createFaustNode(
      audioContext,
      `${modeLabel}_poly_effect_test`,
      polyEffectCode,
      sp,
      bufferSize,
    );
    if (!node) {
      error(`${modeLabel} poly+effect createFaustNode failed`);
      return;
    }
    node.connect(audioContext.destination);
    log(
      `${modeLabel} poly+effect running; inputs/outputs =`,
      node.numberOfInputs,
      node.numberOfOutputs,
    );

    const noteSeq = [
      { note: 60, vel: 100, dur: 600 },
      { note: 64, vel: 100, dur: 600 },
      { note: 67, vel: 100, dur: 600 },
    ];
    for (const { note, vel, dur } of noteSeq) {
      log(`${modeLabel} poly+effect keyOn note ${note}`);
      node.keyOn(0, note, vel);
      await wait(dur);
      node.keyOff(0, note, 0);
      log(`${modeLabel} poly+effect keyOff note ${note}`);
      await wait(150);
    }

    const chord = [60, 64, 67];
    log(`${modeLabel} poly+effect chord on (C major)`);
    chord.forEach((n) => node.keyOn(0, n, 100));
    await wait(2500);
    chord.forEach((n) => node.keyOff(0, n, 0));
    log(`${modeLabel} poly+effect chord off`);
    node.disconnect();
    log(`${modeLabel} poly+effect stopped`);
  } catch (e) {
    error(`${modeLabel} poly+effect test error:`, e);
  }
}

async function main() {
  await audioContext.resume();

  await runMonoPolyTest('AudioWorklet');
  await runPolyEffectTest('AudioWorklet');
  await runMonoPolyTest('ScriptProcessor', true, 1024);
  await runPolyEffectTest('ScriptProcessor', true, 1024);
}

try {
  await main();
} catch (err) {
  console.error('[faust]', 'Fatal error:', err);
  process.exitCode = 1;
} finally {
  await audioContext.close();
}
