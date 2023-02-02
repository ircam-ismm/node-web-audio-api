import { after, before, describe, it } from 'node:test';
import assert from 'node:assert';

import { AudioBuffer, AudioContext } from '../index.mjs';

describe('AudioBuffer', () => {
  let audioContext;

  before(() => {
    console.log('before is run')
    audioContext = new AudioContext();
  });

  after(() => {
    audioContext.close();
  });

  describe(`audioContext.createBuffer`, () => {
    it('should properly create audio buffer', () => {
      const audioBuffer = audioContext.createBuffer(1, 100, audioContext.sampleRate);

      assert.equal(audioBuffer.numberOfChannels, 1);
      assert.equal(audioBuffer.length, 100);
      assert.equal(audioBuffer.sampleRate, audioContext.sampleRate);
    });

    it('should properly fail if missing argument', () => {
      assert.throws(() => {
        const audioBuffer = audioContext.createBuffer(1, 100);
      }, {
        name: 'Error', // should be 'NotSupportedError'
        message: 'AudioBuffer: Invalid options, sampleRate is required',
      });
    });
  });

  describe(`new AudioBuffer(options)`, () => {
    it('should properly create audio buffer', () => {
      const audioBuffer = new AudioBuffer({
        length: 100,
        sampleRate: audioContext.sampleRate,
      });

      assert.equal(audioBuffer.numberOfChannels, 1);
      assert.equal(audioBuffer.length, 100);
      assert.equal(audioBuffer.sampleRate, audioContext.sampleRate);
    });

    it('should properly fail if missing argument', () => {
      assert.throws(() => {
        const audioBuffer = new AudioBuffer({
          length: 100,
        });
      }, {
        name: 'Error', // should be 'NotSupportedError'
        message: 'AudioBuffer: Invalid options, sampleRate is required',
      });
    });
  });
});
