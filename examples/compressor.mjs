import fs from 'node:fs';
import path from 'node:path';
import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const pathname = path.join(process.cwd(), 'samples', 'think-stereo-48000.wav');
const arrayBuffer = fs.readFileSync(pathname).buffer;
const buffer = await audioContext.decodeAudioData(arrayBuffer);

console.log('> no compression');
const src = audioContext.createBufferSource();
src.connect(audioContext.destination);
src.buffer = buffer;
src.start();

await new Promise(resolve => setTimeout(resolve, 3 * 1000));

console.log('> compression (hard knee)');
console.log(`+ attack: 30ms`);
console.log('+ release: 100ms');
console.log('+ ratio: 12');
console.log('>');

for (let i = 0; i < 6; i++) {
  console.log(`+ threshold at ${-10. * i}`);

  const compressor = audioContext.createDynamicsCompressor();
  compressor.connect(audioContext.destination);
  compressor.threshold.value = -10. * i;
  compressor.knee.value = 0.; // hard kne
  compressor.attack.value = 0.03;
  compressor.release.value = 0.1;

  const src = audioContext.createBufferSource();
  src.connect(compressor);
  src.buffer = buffer;
  src.start();

  await new Promise(resolve => setTimeout(resolve, 3 * 1000));
}

await audioContext.close();

