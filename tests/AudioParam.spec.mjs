import { assert } from 'chai';
import { AudioContext } from '../index.mjs';

describe('AudioParam', () => {
  describe('# attributes', () => {
    it(`should implement all attributes`, async () => {
      const audioContext = new AudioContext();
      const gain = audioContext.createGain();

      assert.equal(gain.gain.automationRate, 'a-rate');
      assert.equal(gain.gain.defaultValue, 1);
      // should accept some delta
      assert.equal(gain.gain.maxValue, 3.4028234663852886e+38);
      assert.equal(gain.gain.minValue, -3.4028234663852886e+38);
      assert.equal(gain.gain.value, 1);

      await audioContext.close();
    });
  });
});
