import { AudioContext, OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 48000, 48000);

offline.addEventListener('complete', (e) => {
  console.log('+ complete event:', e.renderedBuffer.toString());
});

offline.suspend(128 / 48000).then(async () => {
  const osc = offline.createOscillator();
  osc.connect(offline.destination);
  osc.frequency.value = 220;
  osc.start(0.);
  osc.stop(1.);

  await offline.resume();
});

const buffer = await offline.startRendering();
console.log('+ buffer duration:', buffer.duration);

console.log('');
console.log('> Playback computed buffer in loop, should hear a small silent gap in the middle');

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const online = new AudioContext({ latencyHint });

const src = online.createBufferSource();
src.buffer = buffer;
src.loop = true;
src.connect(online.destination);
src.start();

await new Promise(resolve => setTimeout(resolve, 2000));

console.log('+ close context');
await online.close();
