import { OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 1, 48000);

const src = offline.createBufferSource();
src.connect({});
// src.start(-1, 1, null);

try {
  // src.start(NaN);
} catch (err) {
  console.log('final err:');
  console.log(err);
}
