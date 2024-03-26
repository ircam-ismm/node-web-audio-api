import { assert } from 'chai';
import { OfflineAudioContext, PeriodicWave } from '../index.mjs';

describe('# PeriodicWave', () => {
  describe('constructor', () => {
    it(`accept any sequence as imag`, () => {
      const audioContext = new OfflineAudioContext(1, 1, 48000);
      const periodicWave = new PeriodicWave(audioContext, {
        imag: [-1, 1],
      });

      assert.isTrue(periodicWave instanceof PeriodicWave);
    });

    it(`accept any sequence as real`, () => {
      const audioContext = new OfflineAudioContext(1, 1, 48000);
      const periodicWave = new PeriodicWave(audioContext, {
        real: [-1, 1],
      });

      assert.isTrue(periodicWave instanceof PeriodicWave);
    });
  });
});

