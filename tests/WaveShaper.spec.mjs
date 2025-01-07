import { assert } from 'chai';
import { AudioContext } from '../index.mjs';

describe('# WaveShaper', () => {
  describe('## curve', () => {
    it('getter should return a copy of the given curve', async () => {
      const context = new AudioContext({});
      const curve = new Float32Array([-1, -0.5, 0, 0.5, 1]);

      const ws = context.createWaveShaper();
      ws.curve = curve;

      // same content
      assert.deepEqual(curve, ws.curve);
      // not the same instance
      assert.notStrictEqual(curve, ws.curve);

      await context.close();
    });
  });
});
