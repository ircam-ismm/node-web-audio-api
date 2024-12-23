import { Blob } from 'node:buffer';
import path from 'node:path';
import fs from 'node:fs';

import { assert } from 'chai';
import { AudioContext, OscillatorNode, GainNode, AudioWorkletNode } from '../index.mjs';
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
      await audioContext.audioWorklet.addModule('./tests/worklets/noise-generator.worklet.mjs');

      const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
      noiseGeneratorNode.connect(audioContext.destination);

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();
    });

    it(`should support loading from caller relative path`, async () => {
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('./worklets/noise-generator.worklet.mjs');

      const noiseGeneratorNode = new AudioWorkletNode(audioContext, 'noise-generator');
      noiseGeneratorNode.connect(audioContext.destination);

      assert.isTrue(noiseGeneratorNode instanceof AudioWorkletNode);

      await delay(50);
      await audioContext.close();
    });

    it(`should support loading from absolute path`, async () => {
      const pathname = path.join(process.cwd(), 'tests/worklets/noise-generator.worklet.mjs');
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
        'tests/worklets/noise-generator.worklet.mjs',
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
        'tests/worklets/noise-generator.worklet.mjs',
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

    it(`should throw clean error if worklet is invalid`, async () => {
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

    it(`should throw clean error if worklet is invalid`, async () => {
      const audioContext = new AudioContext();
      let errored = false;

      try {
        await audioContext.audioWorklet.addModule('./worklets/invalid.worklet.mjs');
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
        await audioContext.audioWorklet.addModule('./worklets/do-not-exists.worklet.mjs');
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
  describe('# constructor', () => {
    it('should throw a clean error when processor constructor is invalid', async () => {
      let errored = false;

      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('./worklets/invalid-ctor.worklet.mjs');

      const invalid = new AudioWorkletNode(audioContext, 'invalid-ctor');
      invalid.addEventListener('processorerror', (e) => {
        prettyPrintErr(e.error);
        errored = true;
      });

      await delay(100);
      await audioContext.close();
      assert.isTrue(errored);
    });
  });
})
