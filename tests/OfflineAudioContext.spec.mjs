import { assert } from 'chai';
import {
  AudioContext,
  OfflineAudioContext,
} from '../index.mjs';

describe('# OfflineAudioContext', () => {
  describe('## await startRendering()', () => {
    it('buffer returned by startRedring and buffer from complete should be same instance', async () => {
      const offline = new OfflineAudioContext(1, 48000, 48000);

      let aResult = null;
      let bResult = null;

      offline.addEventListener('complete', (e) => aResult = e.renderedBuffer);

      const osc = offline.createOscillator();
      osc.connect(offline.destination);
      osc.frequency.value = 220;
      osc.start(0.);
      osc.stop(1.);

      bResult = await offline.startRendering();
      // make sure we received the event
      await new Promise(resolve => setTimeout(resolve, 100));

      assert.deepEqual(aResult, bResult);
    });
  });
});


