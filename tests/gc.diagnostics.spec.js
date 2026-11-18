import { assert } from 'chai';
import {
  AudioContext,
  AudioBufferSourceNode,
  ConstantSourceNode,
  OscillatorNode,
  ScriptProcessorNode,
} from '../index.js';
import {
  delay,
} from '@ircam/sc-utils';

import '../js/lib/expose-gc.js';

function getBuffer(audioContext, duration) {
  const sampleRate = audioContext.sampleRate;
  const length = Math.round(duration * sampleRate)
  return audioContext.createBuffer(1, length, sampleRate);
}

describe('[diagnostic] AudioScheduledSourceNode ended event', () => {
  it('AudioBufferSourceNode should be properly garbage collected - buffer end', async function() {
    this.timeout(10 * 1000);

    const audioContext = new AudioContext();

    if (!audioContext.runDiagnostics) {
      throw new Error('Test rely on diagnostics features, use `npm run build:diagnostics && npm run test`')
    }

    const duration = 0.1;
    let endedTriggered = false;
    let nodeCount = null;

    const buffer = getBuffer(audioContext, duration);
    let src = new AudioBufferSourceNode(audioContext, { buffer });
    src.connect(audioContext.destination);

    src.addEventListener('ended', () => endedTriggered = true);
    src.start();

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(duration * 1000 * 2);

    assert.isTrue(endedTriggered);
    assert.equal(nodeCount, 4); // AudioBufferSourceNode: 1 node + 2 params

    src = null;
    global.gc();

    await delay(100);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);
    assert.equal(nodeCount, 1);

    await audioContext.close();
  });

  it('AudioBufferSourceNode should be properly garbage collected - stop()', async function() {
    this.timeout(10 * 1000);

    const audioContext = new AudioContext();

    if (!audioContext.runDiagnostics) {
      throw new Error('Test rely on diagnostics features, use `npm run build:diagnostics && npm run test`')
    }

    const duration = 0.1;
    const now = audioContext.currentTime;
    let endedTriggered = false;
    let nodeCount = null;

    const buffer = getBuffer(audioContext, duration);
    let src = new AudioBufferSourceNode(audioContext, { buffer });
    src.connect(audioContext.destination);

    src.addEventListener('ended', () => endedTriggered = true);
    src.start(now);
    src.stop(now + duration / 2);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    assert.isTrue(endedTriggered);
    assert.equal(nodeCount, 4); // AudioBufferSourceNode: 1 node + 2 params

    src = null;
    global.gc();

    await delay(100);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    assert.equal(nodeCount, 1);

    await audioContext.close();
  });

  it('ConstantSourceNode should be properly garbage collected - stop()', async function() {
    this.timeout(10 * 1000);

    const audioContext = new AudioContext();

    if (!audioContext.runDiagnostics) {
      throw new Error('Test rely on diagnostics features, use `npm run build:diagnostics && npm run test`')
    }

    const duration = 0.1;
    const now = audioContext.currentTime;
    let endedTriggered = false;
    let nodeCount = null;

    let src = new ConstantSourceNode(audioContext, { offset: 0.5 });
    src.connect(audioContext.destination);
    src.addEventListener('ended', () => endedTriggered = true);
    src.start(now);
    src.stop(now + duration / 2);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    assert.isTrue(endedTriggered);
    assert.equal(nodeCount, 3); // ConstantSourceNode: 1 node + 1 param

    src = null;
    global.gc();

    await delay(100);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    assert.equal(nodeCount, 1);

    await audioContext.close();
  });

  it('OscillatorNode should be properly garbage collected - stop()', async function() {
    this.timeout(10 * 1000);

    const audioContext = new AudioContext();

    if (!audioContext.runDiagnostics) {
      throw new Error('Test rely on diagnostics features, use `npm run build:diagnostics && npm run test`')
    }

    const duration = 0.1;
    const now = audioContext.currentTime;
    let endedTriggered = false;
    let nodeCount = null;

    let src = new OscillatorNode(audioContext, { frequency: 0.2 });
    src.connect(audioContext.destination);
    src.addEventListener('ended', () => endedTriggered = true);
    src.start(now);
    src.stop(now + duration / 2);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    assert.isTrue(endedTriggered);
    assert.equal(nodeCount, 4); // OscillatorNode: 1 node + 2 params

    src = null;
    global.gc();

    await delay(100);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    assert.equal(nodeCount, 1);

    await audioContext.close();
  });
});

describe.skip('[diagnostic] ScriptProcessorNode', () => {
  // Using a WeakRef solve the garbage collection issue but then we fall into
  // a weird race condition where the rust processor seems to be dropped during
  // the js callback which triggers a panic
  // This needs to be investigated to be fixed properly
  // As this node is deprecated anyway, let's keep the GC issue for now
  it('ScriptProcessorNode should be properly garbage collected', async function() {
    this.timeout(10 * 1000);

    const audioContext = new AudioContext();

    if (!audioContext.runDiagnostics) {
      throw new Error('Test rely on diagnostics features, use `npm run build:diagnostics && npm run test`')
    }

    const duration = 0.1;
    const now = audioContext.currentTime;
    let endedTriggered = false;
    let nodeCount = null;
    let blockCount = 0;

    const src = new ConstantSourceNode(audioContext);
    let script = new ScriptProcessorNode(audioContext);
    src.connect(script).connect(audioContext.destination);
    script.addEventListener('audioprocess', () => {
      blockCount += 1;
    });

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    // ConstantSourceNode: 1 node + 1 params
    // ScriptProcessorNode: 1 node + 0 params
    assert.equal(nodeCount, 4);

    // no input, and control handle is GCed
    src.disconnect();
    script.disconnect();
    script = null;
    global.gc();

    const finalBlockCount = blockCount;

    await delay(100);

    audioContext.runDiagnostics(result => {
      console.log('# graph size:', result.graph.nodeCount);
      nodeCount = result.graph.nodeCount;
    });

    await delay(100);

    assert.equal(nodeCount, 3); // Constant source is still in graph
    assert.equal(finalBlockCount, blockCount);

    await audioContext.close();
  });
});

