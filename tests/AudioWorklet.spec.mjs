import { Blob } from 'node:buffer';
import { assert } from 'chai';
import { AudioContext, OscillatorNode, AudioWorkletNode } from '../index.mjs';

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
    it.skip(`should support loading from url`, async () => {});
  });
});
