import { OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 1, 48000);

const gain = offline.createGain();
gain.connect(offline.destination);

const src = offline.createBufferSource();

src.connect({});

// src.connect(gain);
// src.disconnect({});
