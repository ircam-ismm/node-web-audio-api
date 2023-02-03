import { AudioContext, OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 44100, 44100);

const osc = offline.createOscillator();
osc.connect(offline.destination);
osc.frequency.value = 220;
osc.start(0);
osc.stop(1);

const buffer = await offline.startRendering();
console.log(buffer);
// console.log(buffer.getChannelData(0));

const online = new AudioContext();
const src = online.createBufferSource();
src.buffer = buffer;
src.connect(online.destination);
src.start();

await new Promise(resolve => setTimeout(resolve, 1000));

await online.close();
