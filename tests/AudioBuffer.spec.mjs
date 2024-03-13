import path from 'node:path';
import fs from 'node:fs';
import { assert } from 'chai';
import { AudioBuffer, AudioContext, OfflineAudioContext } from '../index.mjs';

describe('# AudioBuffer', () => {

  describe(`## audioContext.createBuffer(numChannels, length, sampleRate)`, () => {
    it('should properly create audio buffer', () => {
      const audioContext = new AudioContext();
      const audioBuffer = audioContext.createBuffer(1, 100, audioContext.sampleRate);

      assert.equal(audioBuffer instanceof AudioBuffer, true);
      assert.equal(audioBuffer.numberOfChannels, 1);
      assert.equal(audioBuffer.length, 100);
      assert.equal(audioBuffer.sampleRate, audioContext.sampleRate);

      // @fixme - do not lock the process
      audioContext.close();
    });

    it('should properly fail if missing argument', () => {
      const audioContext = new AudioContext();
      assert.throws(() => {
        const audioBuffer = audioContext.createBuffer(1, 100);
      });

      audioContext.close();
    });
  });

  describe(`## new AudioBuffer(options)`, () => {
    it('should properly create audio buffer', () => {
      const audioBuffer = new AudioBuffer({
        length: 100,
        sampleRate: 48000,
      });

      assert.equal(audioBuffer instanceof AudioBuffer, true);
      assert.equal(audioBuffer.numberOfChannels, 1);
      assert.equal(audioBuffer.length, 100);
      assert.equal(audioBuffer.sampleRate, 48000);
    });

    it('should properly fail if missing argument', () => {
      assert.throws(() => {
        const audioBuffer = new AudioBuffer({ length: 100 });
      });
    });

    it(`should have clean error type`, () => {
      try {
        new AudioBuffer(Date, 42);
      } catch (err) {
        console.log(err.name, ':', err.message);
        assert.isTrue(err instanceof TypeError);
      }
    });
  });

  describe(`## AudioBuffer returned by other means`, () => {
    it(`AudioContext.decodeAudioData() -> AudioBuffer`, async () => {
      const pathname = path.join('examples', 'samples', 'sample.wav');
      const buffer = fs.readFileSync(pathname).buffer;
      const audioContext = new OfflineAudioContext(1, 1, 48000);
      const audioBuffer = await audioContext.decodeAudioData(buffer);

      assert.equal(audioBuffer instanceof AudioBuffer, true);
      // make sure we use the underlying native buffer
      const emptyBuffer = new Float32Array(audioBuffer.length).fill(0);
      assert.notDeepEqual(audioBuffer.getChannelData(0), emptyBuffer);
      // @fixme - do not lock the process
      audioContext.startRendering();
    });

    it(`OfflineAudioContext.decodeAudioData() -> AudioBuffer`, async () => {
      const pathname = path.join('examples', 'samples', 'sample.wav');
      const buffer = fs.readFileSync(pathname).buffer;
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(buffer);

      assert.equal(audioBuffer instanceof AudioBuffer, true);
      // make sure we use the underlying native buffer
      const emptyBuffer = new Float32Array(audioBuffer.length).fill(0);
      assert.notDeepEqual(audioBuffer.getChannelData(0), emptyBuffer);
      // @fixme - do not lock the process
      audioContext.close();
    });

    it(`OfflineAudioContext.startRendering() -> AudioBuffer`, async () => {
      const audioContext = new OfflineAudioContext(1, 1000, 48000);
      const src = audioContext.createOscillator();
      src.connect(audioContext.destination);
      src.start(0);

      const audioBuffer = await audioContext.startRendering();
      assert.equal(audioBuffer instanceof AudioBuffer, true);
      // make sure we use the underlying native buffer
      const emptyBuffer = new Float32Array(audioBuffer.length).fill(0);
      assert.notDeepEqual(audioBuffer.getChannelData(0), emptyBuffer);
    });
  });

  describe(`AudioBufferSourceNode.buffer`, () => {
    it(`should work properly`, async () => {
      const audioContext = new AudioContext();

      const pathname = path.join('examples', 'samples', 'sample.wav');
      const buffer = fs.readFileSync(pathname).buffer;
      const audioBuffer = await audioContext.decodeAudioData(buffer);

      const src = audioContext.createBufferSource();
       // should retrieve native audio buffer to native buffer source node
      src.buffer = audioBuffer;
      src.connect(audioContext.destination);

      assert.deepEqual(src.buffer, audioBuffer);

      src.start(audioContext.currentTime);
      src.stop(audioContext.currentTime + 0.3);

      await new Promise(resolve => setTimeout(resolve, 400));
      await audioContext.close();
    });
  });
});







