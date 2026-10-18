import { Blob } from 'node:buffer';
import path from 'node:path';
import fs from 'node:fs';

import { assert } from 'chai';
import {
  AudioContext,
  AudioWorkletNode,
  GainNode,
  OfflineAudioContext,
  OscillatorNode,
} from '../index.js';
import { delay } from '@ircam/sc-utils';

const scriptTexts = `
class FirstProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const output = outputs[0];

    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    });

    return true;
  }
}

registerProcessor('first-processor', FirstProcessor);

class SecondProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const output = outputs[0];

    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    });

    return true;
  }
}

registerProcessor('second-processor', SecondProcessor);
`;

function prettyPrintErr(err) {
  const parts = err.stack.split('\n');
  console.log(parts[0]);
  console.log(parts[1]);
  console.log('    ...');
}

describe('AudioWorklet', () => {
  describe('# addModule(moduleUrl)', () => {
    it(`should support loading from Blob`, async () => {
      const blob = new Blob([scriptTexts], { type: 'application/javascript' });
      const objectUrl = URL.createObjectURL(blob);

      const audioContext = new AudioContext();
      let errored = false;

      try {
        await audioContext.audioWorklet.addModule(objectUrl);

        const _firstProcessor = new AudioWorkletNode(audioContext, 'first-processor');
        const _secondProcessor = new AudioWorkletNode(audioContext, 'second-processor');
      } catch (err) {
        errored = true;
        console.log(err.message);
      }

      await audioContext.close();
      assert.isFalse(errored);
    });

    it(`should support loading from cwd relative path`, async () => {
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('./tests/worklets/noise-generator.worklet.js');

      const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
      noiseGeneratorNode.connect(audioContext.destination);

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();
    });

    it(`should support loading from caller relative path`, async () => {
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('./worklets/noise-generator.worklet.js');

      const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
      noiseGeneratorNode.connect(audioContext.destination);

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();
    });

    it(`should support loading from absolute path`, async () => {
      const pathname = path.join(process.cwd(), 'tests/worklets/noise-generator.worklet.js');
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule(pathname);

      const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
      noiseGeneratorNode.connect(audioContext.destination);

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();
    });

    it(`should support loading from node_modules 1: use package.json "main"`, async () => {
      // create dummy npm package
      fs.mkdirSync('node_modules/audio-worklet-test', { recursive: true });
      fs.writeFileSync('node_modules/audio-worklet-test/package.json', JSON.stringify({
        name: 'audio-worklet-test',
        type: 'module',
        main: 'noise-generator.js',
      }, null, 2));
      fs.copyFileSync(
        'tests/worklets/noise-generator.worklet.js',
        'node_modules/audio-worklet-test/noise-generator.js',
      );

      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('audio-worklet-test');

      const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
      noiseGeneratorNode.connect(audioContext.destination);

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();

      fs.rmSync('node_modules/audio-worklet-test', { force: true, recursive: true });
    });

    it(`should support loading from node_modules 2: use filename`, async () => {
      // create dummy npm package
      fs.mkdirSync('node_modules/audio-worklet-test', { recursive: true });
      fs.writeFileSync('node_modules/audio-worklet-test/package.json', JSON.stringify({
        name: 'audio-worklet-test',
        type: 'module',
      }, null, 2));
      fs.copyFileSync(
        'tests/worklets/noise-generator.worklet.js',
        'node_modules/audio-worklet-test/noise-generator.js',
      );

      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('audio-worklet-test/noise-generator.js');

      const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
      noiseGeneratorNode.connect(audioContext.destination);

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();

      fs.rmSync('node_modules/audio-worklet-test', { force: true, recursive: true });
    });

    it(`should support loading from url`, async () => {
      // cf. https://googlechromelabs.github.io/web-audio-samples/audio-worklet/basic/noise-generator/
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

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();
    });

    it(`should throw clean error if worklet is invalid (1)`, async () => {
      // blob worklets do not support import
      const blob = new Blob(['import stuff from "./abc"'], { type: 'application/javascript' });
      const objectUrl = URL.createObjectURL(blob);

      const audioContext = new AudioContext();
      let errored = false;

      try {
        await audioContext.audioWorklet.addModule(objectUrl);
      } catch (err) {
        prettyPrintErr(err);
        errored = true;
      }

      await audioContext.close();
      assert.isTrue(errored);
    });

    it(`should throw clean error if worklet is invalid (2)`, async () => {
      const audioContext = new AudioContext();
      let errored = false;

      try {
        await audioContext.audioWorklet.addModule('./worklets/invalid.worklet.js');
      } catch (err) {
        prettyPrintErr(err);
        errored = true;
      }

      await audioContext.close();
      assert.isTrue(errored);
    });

    it(`should throw AbortError if file not found`, async () => {
      const audioContext = new AudioContext();
      let errored = false;

      try {
        await audioContext.audioWorklet.addModule('./worklets/do-not-exists.worklet.js');
      } catch (err) {
        prettyPrintErr(err);
        errored = true;
      }

      await audioContext.close();
      assert.isTrue(errored);
    });
  });
});

describe('AudioWorkletProcessor', () => {
  it('should throw a clean error when processor constructor is invalid', async () => {
    let errored = false;

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('./worklets/invalid-ctor.worklet.js');

    const invalid = new AudioWorkletNode(audioContext, 'invalid-ctor');
    invalid.addEventListener('processorerror', (e) => {
      prettyPrintErr(e.error);
      errored = true;
    });

    await delay(100);
    await audioContext.close();
    assert.isTrue(errored);
  });

  it('should throw a clean error when process is not callable', async () => {
    let errored = false;

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('./worklets/invalid-process.worklet.js');

    const invalid = new AudioWorkletNode(audioContext, 'invalid-process');
    invalid.addEventListener('processorerror', (e) => {
      prettyPrintErr(e.error);
      errored = true;
    });

    await delay(1000);
    await audioContext.close();
    assert.isTrue(errored);
  });

  it('should throw a clean error when process throws', async () => {
    let errored = false;

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('./worklets/invalid-process.worklet.js');

    const invalid = new AudioWorkletNode(audioContext, 'process-throws');
    invalid.onprocessorerror = (e) => {
      prettyPrintErr(e.error);
      errored = true;
    };

    await delay(1000);
    await audioContext.close();
    assert.isTrue(errored);
  });

  it('should throw a clean error when process throws raw message', async () => {
    let errored = false;

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('./worklets/invalid-process.worklet.js');

    const invalid = new AudioWorkletNode(audioContext, 'process-throws-raw');
    invalid.addEventListener('processorerror', (e) => {
      prettyPrintErr(e.error);
      errored = true;
    });

    await delay(1000);
    await audioContext.close();
    assert.isTrue(errored);
  });

  it('OfflineAudioContext.startRendering should return when processor constructor is invalid', async () => {
    const audioContext = new OfflineAudioContext(1, 128, 48000);
    await audioContext.audioWorklet.addModule('./worklets/invalid-ctor.worklet.js');

    const invalid = new AudioWorkletNode(audioContext, 'invalid-ctor');
    invalid.addEventListener('processorerror', e => prettyPrintErr(e.error));

    const buffer = await audioContext.startRendering();
    assert.deepEqual(buffer.getChannelData(0), new Float32Array(128).fill(0));
  });

  it('should put the processor in error state when a process call cannot be prepared', async () => {
    // Removes processor state the Worker reads on every call, so the next call fails in Rust
    const code = `
      class BreaksBridge extends AudioWorkletProcessor {
        process(inputs, outputs) {
          outputs[0][0].fill(1);
          delete this[Symbol.for('node-web-audio-api:worklet-outputs')];
          return true;
        }
      }
      registerProcessor('breaks-bridge', BreaksBridge);
    `;
    const objectUrl = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
    const audioContext = new OfflineAudioContext(1, 4800, 48000);
    await audioContext.audioWorklet.addModule(objectUrl);

    const node = new AudioWorkletNode(audioContext, 'breaks-bridge');
    node.connect(audioContext.destination);
    const errored = new Promise(resolve => node.onprocessorerror = resolve);

    const buffer = await audioContext.startRendering();
    assert.deepEqual(buffer.getChannelData(0).subarray(128), new Float32Array(4800 - 128).fill(0));
    await errored;
  });

  it('should give parameters to processors created while the context renders', async function() {
    this.timeout(10000);
    // The render thread can call a new node before the Worker has created its
    // processor; `busy` keeps the Worker occupied so this happens regularly
    const code = `
      class Busy extends AudioWorkletProcessor {
        process(inputs, outputs) {
          let sum = 0;
          for (let i = 0; i < 400000; i++) sum += i;
          outputs[0][0][0] = sum * 0;
          return true;
        }
      }
      class Probe extends AudioWorkletProcessor {
        static get parameterDescriptors() { return [{ name: 'p', automationRate: 'k-rate' }]; }
        constructor() { super(); this.calls = 0; }
        process(inputs, outputs, parameters) {
          if (++this.calls === 50) this.port.postMessage('p' in parameters);
          return true;
        }
      }
      registerProcessor('busy', Busy);
      registerProcessor('probe', Probe);
    `;
    const objectUrl = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
    const audioContext = new AudioContext({ sinkId: { type: 'none' } });
    await audioContext.audioWorklet.addModule(objectUrl);
    new AudioWorkletNode(audioContext, 'busy').connect(audioContext.destination);
    await delay(100);

    const reports = [];
    for (let i = 0; i < 150; i++) {
      const probe = new AudioWorkletNode(audioContext, 'probe');
      reports.push(new Promise(resolve => probe.port.onmessage = e => resolve(e.data)));
      probe.connect(audioContext.destination);
      await delay(3);
    }

    const hasParams = await Promise.all(reports);
    await audioContext.close();
    assert.equal(hasParams.filter(has => !has).length, 0);
  });
});
