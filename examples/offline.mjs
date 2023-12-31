import { AudioContext, OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 48000, 48000);

// offline.addEventListener('statechange', () => {
//   console.log('> statechange event:', offline.state);
// });

// offline.addEventListener('complete', (e) => {
//   console.log('> complete event:', e.renderedBuffer);
// });

offline.suspend(128 / 48000).then(async () => {
  console.log('suspend', offline.state);

  const osc = offline.createOscillator();
  osc.connect(offline.destination);
  osc.frequency.value = 220;
  osc.start(0);

  await offline.resume();
  console.log('resume', offline.state);
});

const buffer = await offline.startRendering();
console.log('buffer duration:', buffer.duration);

// dirty check the audio buffer
const channelData = buffer.getChannelData(0);

for (let i = 0; i < 48000; i++) {
  // before suspend the graph is empty
  if (i < 128) {
    if (channelData[i] !== 0) {
      throw new Error('should be zero');
    }
  // first sine sample is zero
  } else if (i === 128) {
    if (channelData[i] !== 0) {
      throw new Error('should be zero');
    }
  } else {
    // should ha ve a sine wave, hopefully without zero values :)
    if (channelData[i] === 0) {
      throw new Error(`should not be zero ${i}`);
    }
  }
}

console.log('> playback computed buffer in loop (should have a small silent gap)');

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const online = new AudioContext({ latencyHint });

const src = online.createBufferSource();
// src.loop = true;
src.buffer = buffer;
src.loop = true;
src.connect(online.destination);
src.start();

await new Promise(resolve => setTimeout(resolve, 2000));

console.log('close context');
await online.close();
