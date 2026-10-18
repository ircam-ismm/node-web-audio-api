import { Blob } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';

import { assert } from 'chai';
import {
  AudioContext,
  AudioWorkletNode,
  OfflineAudioContext,
} from '../index.js';

// A file module, which imports asynchronously, unlike a Blob
const probeModule = path.join(import.meta.dirname, 'worklets', 'scope-probe.worklet.js');

const lateCode = fs.readFileSync(probeModule, 'utf8')
  .replaceAll('ScopeProbe', 'LateProbe')
  .replace('scope-probe', 'late-probe');

function moduleUrl(code) {
  return URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
}

/** Render 4 probes, each in its own group when `grouped`, return the output and the scope ids */
async function renderProbes(grouped) {
  const context = new OfflineAudioContext({
    numberOfChannels: 1,
    length: 128 * 20,
    sampleRate: 48000,
    renderThreads: 4,
  });
  await context.audioWorklet.addModule(probeModule);

  const scopes = new Set();
  for (let group = 1; group <= 4; group++) {
    if (grouped) {
      context.setRenderGroup(group);
    }
    const probe = new AudioWorkletNode(context, 'scope-probe');
    probe.port.on('message', scopeId => scopes.add(scopeId));
    probe.connect(context.destination);
  }

  const buffer = await context.startRendering();
  // let the scope ids arrive
  await new Promise(resolve => setTimeout(resolve, 50));

  return { output: buffer.getChannelData(0), scopes };
}

describe('Render groups', () => {
  it('renders the worklets of each group in their own AudioWorkletGlobalScope', async () => {
    const { scopes } = await renderProbes(true);
    assert.equal(scopes.size, 4);
  });

  it('renders the same audio with and without groups', async () => {
    const plain = await renderProbes(false);
    const grouped = await renderProbes(true);

    assert.equal(plain.scopes.size, 1);
    assert.closeTo(plain.output[100], 0.4, 1e-6);
    assert.deepEqual(Array.from(grouped.output), Array.from(plain.output));
  });

  it('loads modules added after a group started into that group too', async () => {
    const context = new OfflineAudioContext({ length: 128 * 20, sampleRate: 48000 });
    await context.audioWorklet.addModule(probeModule);

    context.setRenderGroup(1);
    new AudioWorkletNode(context, 'scope-probe').connect(context.destination);
    await context.audioWorklet.addModule(moduleUrl(lateCode));

    const scopes = new Set();
    const late = new AudioWorkletNode(context, 'late-probe');
    late.port.on('message', scopeId => scopes.add(scopeId));
    late.connect(context.destination);

    const buffer = await context.startRendering();
    await new Promise(resolve => setTimeout(resolve, 50));

    assert.equal(scopes.size, 1);
    assert.closeTo(buffer.getChannelData(0)[100], 0.2, 1e-6);
  });

  it('accepts renderThreads in AudioContext options', async () => {
    const context = new AudioContext({ sinkId: { type: 'none' }, renderThreads: 4 });
    context.setRenderGroup(1);
    await context.close();
  });
});
