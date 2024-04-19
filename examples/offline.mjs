import { AudioContext, OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 48000, 48000);


let aResult = null;
let bResult = null;

offline.addEventListener('complete', (e) => {
  console.log('+ complete event:', e.renderedBuffer.toString());
  aResult = e.renderedBuffer;
});

offline.suspend(128 / 48000).then(async () => {
  const osc = offline.createOscillator();
  osc.connect(offline.destination);
  osc.frequency.value = 220;
  osc.start(0.);
  osc.stop(1.);

  await offline.resume();
});

// offline.startRendering().then(audioBuffer => console.log(audioBuffer));
const buffer = await offline.startRendering();
console.log('+ buffer duration:', buffer.duration);

bResult = buffer;

await new Promise(resolve => setTimeout(resolve, 100));

console.log(aResult === bResult);

// console.log('')
// console.log('> Playback computed buffer in loop, should hear a small silent gap in the middle');

// const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
// const online = new AudioContext({ latencyHint });

// const src = online.createBufferSource();
// // src.loop = true;
// src.buffer = aResult;
// src.loop = true;
// src.connect(online.destination);
// src.start();

// await new Promise(resolve => setTimeout(resolve, 2000));

// console.log('close context');
// await online.close();
