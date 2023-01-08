import path from 'node:path';
import { AudioContext, load } from '../index.mjs';

const context = new AudioContext();

const file = load(path.join(process.cwd(), 'samples', 'think-stereo-48000.wav'));
const buffer = await context.decodeAudioData(file);

console.log('> no compression');
const src = context.createBufferSource();
src.connect(context.destination);
src.buffer = buffer;
src.start();

await new Promise(resolve => setTimeout(resolve, 3 * 1000));

console.log('> compression (hard knee)');
console.log('+ attack: {:?}ms', 30);
console.log('+ release: {:?}ms', 100);
console.log('+ ratio: {:?}', 12);
console.log('>');

for (let i = 0; i < 6; i++) {
  console.log('+ threshold at {:?}', -10. * i);

  const compressor = context.createDynamicsCompressor();
  compressor.connect(context.destination);
  compressor.threshold.value = -10. * i;
  compressor.knee.value = 0.; // hard kne
  compressor.attack.value = 0.03;
  compressor.release.value = 0.1;

  const src = context.createBufferSource();
  src.connect(compressor);
  src.buffer = buffer;
  src.start();

  await new Promise(resolve => setTimeout(resolve, 3 * 1000));
}

await context.close();

