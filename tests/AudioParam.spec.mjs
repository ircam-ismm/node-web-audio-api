import { assert } from 'chai';
import { AudioContext } from '../index.mjs';

describe('# AudioBuffer', () => {
  let audioContext;

  beforeEach(() => {
    audioContext = new AudioContext();
  });

  afterEach(() => {
    audioContext.close();
  });

  describe('attributes', () => {
    it(`should implement all attributes`, () => {
      const gain = audioContext.createGain();

      assert.equal(gain.gain.automationRate, 'a-rate');
      assert.equal(gain.gain.defaultValue, 1);
      // should accept some delta
      assert.equal(gain.gain.maxValue, 3.4028234663852886e+38);
      assert.equal(gain.gain.minValue, -3.4028234663852886e+38);
      assert.equal(gain.gain.value, 1);
    });
  });
});
