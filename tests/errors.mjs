import { OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 1, 48000);

const src = offline.createBufferSource();

try {
  src.start(-1.)
} catch (err) {
  console.log('final err:');
  console.log(err);
}
