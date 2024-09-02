import { assert } from 'chai';
import {
  AudioContext,
  AudioBuffer,
  OfflineAudioContext,
} from '../index.mjs';

describe('# OfflineAudioContext', () => {
  describe('## await startRendering()', () => {
    it('buffer returned by startRendering and buffer from `oncomplete` event should be same instance', async () => {
      const offline = new OfflineAudioContext(1, 48000, 48000);

      let aResult = null;
      let bResult = null;
      let renderingEnded = false;

      offline.addEventListener('complete', (e) => {
        // check that the complete event is triggered after startRendering fulfills
        assert.isTrue(renderingEnded);
        aResult = e.renderedBuffer;
      });

      const osc = offline.createOscillator();
      osc.connect(offline.destination);
      osc.frequency.value = 220;
      osc.start(0.);
      osc.stop(1.);

      bResult = await offline.startRendering();
      renderingEnded = true;
      // make sure we received the event
      await new Promise(resolve => setTimeout(resolve, 100));

      assert.isTrue(aResult instanceof AudioBuffer);
      assert.isTrue(bResult instanceof AudioBuffer);
      assert.deepEqual(aResult, bResult);
    });
  });
});


