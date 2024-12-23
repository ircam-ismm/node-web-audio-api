import { Blob } from 'node:buffer';
import { assert } from 'chai';
import { AudioContext, OscillatorNode, AudioWorkletNode } from '../index.mjs';
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

describe('AudioWorklet', () => {
  describe('# addModule(moduleUrl', () => {
    it(`should support loading from Blob`, async () => {
      const blob = new Blob([scriptTexts], { type: 'application/javascript' });
      const objectUrl = URL.createObjectURL(blob);

      const audioContext = new AudioContext();
      let errored = false;

      try {
        // should support blobs
        await audioContext.audioWorklet.addModule(objectUrl);

        const firstProcessor = new AudioWorkletNode(audioContext, 'first-processor');
        const secondProcessor = new AudioWorkletNode(audioContext, 'second-processor');
      } catch (err) {
        errored = true;
        console.log(err.message);
      }

      await audioContext.close();
      assert.isFalse(errored);
    });

    it.skip(`should support loading from cwd relative path`, async () => {});
    it.skip(`should support loading from caller relative path`, async () => {});
    it.skip(`should support loading from node_modules`, async () => {});
    it.skip(`should support loading from url`, async () => {});

    it(`should throw clean error`, async () => {
      // blob worklets do not support import
      const blob = new Blob(['import stuff from "./abc"'], { type: 'application/javascript' });
      const objectUrl = URL.createObjectURL(blob);

      const audioContext = new AudioContext();
      let errored = false;

      try {
        await audioContext.audioWorklet.addModule(objectUrl);
      } catch (err) {
        console.log(err);
        errored = true;
      }

      await audioContext.close();
      assert.isTrue(errored);
    });

    it(`should throw clean error`, async () => {
      const audioContext = new AudioContext();
      let errored = false;

      try {
        await audioContext.audioWorklet.addModule('./worklets/invalid.worklet.mjs');
      } catch (err) {
        console.log(err);
        errored = true;
      }

      await audioContext.close();
      assert.isTrue(errored);
    });
  });
});

describe('AudioWorkletNode', () => {
  describe('# processor', () => {
    it('should throw a clean error when processor constructor is invalid', async () => {
      let errored = false;

      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('./worklets/invalid-ctor.worklet.mjs');

      const invalid = new AudioWorkletNode(audioContext, 'invalid-ctor');
      invalid.addEventListener('processorerror', (e) => {
        console.log(e.error);
        errored = true;
      });

      await delay(100);
      await audioContext.close();
      assert.isTrue(errored);
    });
  });
})
