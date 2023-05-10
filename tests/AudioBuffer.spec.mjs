import { assert } from 'chai';
import { AudioBuffer, AudioContext } from '../index.mjs';

describe('# AudioBuffer', () => {
  let audioContext;

  before(() => {
    audioContext = new AudioContext();
  });

  after(() => {
    audioContext.close();
  });

  describe(`## audioContext.createBuffer`, () => {
    it('should properly create audio buffer', () => {
      const audioBuffer = audioContext.createBuffer(1, 100, audioContext.sampleRate);

      assert.equal(audioBuffer.numberOfChannels, 1);
      assert.equal(audioBuffer.length, 100);
      assert.equal(audioBuffer.sampleRate, audioContext.sampleRate);
    });

    it('should properly fail if missing argument', () => {
      assert.throws(() => {
        const audioBuffer = audioContext.createBuffer(1, 100);
      });
    });
  });

  describe(`## new AudioBuffer(options)`, () => {
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
        const audioBuffer = new AudioBuffer({ length: 100 });
      });
    });

    it(`should have type error`, () => {
      try {
        new AudioBuffer(Date, 42);
      } catch (err) {
        console.log(err.type);
        console.log(err.name);
        console.log(err.message);
        assert.fail('should be TypeError');
      }
    });
  });
});
