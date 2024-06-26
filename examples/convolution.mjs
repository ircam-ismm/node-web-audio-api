import fs from 'node:fs';
import path from 'node:path';
import { AudioContext, ConvolverNode } from '../index.mjs';

// create an `AudioContext` and load a sound file
const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

audioContext.renderCapacity.addEventListener('update', e => {
  const { timestamp, averageLoad, peakLoad, underrunRatio } = e;
  console.log('AudioRenderCapacityEvent:', { timestamp, averageLoad, peakLoad, underrunRatio });
});
audioContext.renderCapacity.start({ updateInterval: 1.5 });

const arrayBuffer = fs.readFileSync(path.join('examples', 'samples', 'vocals-dry.wav')).buffer;
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

const impulseFile1 = fs.readFileSync(path.join('examples', 'samples', 'small-room-response.wav')).buffer;
const impulseBuffer1 = await audioContext.decodeAudioData(impulseFile1);

const impulseFile2 = fs.readFileSync(path.join('examples', 'samples', 'parking-garage-response.wav')).buffer;
const impulseBuffer2 = await audioContext.decodeAudioData(impulseFile2);

const src = audioContext.createBufferSource();
src.buffer = audioBuffer;

const convolve = new ConvolverNode(audioContext);

src.connect(convolve);
convolve.connect(audioContext.destination);

src.start();

console.log('Dry');
await new Promise(resolve => setTimeout(resolve, 4000));

console.log('Small room');
convolve.buffer = impulseBuffer1;
await new Promise(resolve => setTimeout(resolve, 4000));

console.log('Parking garage');
convolve.buffer = impulseBuffer2;
await new Promise(resolve => setTimeout(resolve, 5000));

console.log('Stop input - flush out remaining impulse response');
src.stop();
await new Promise(resolve => setTimeout(resolve, 2000));

await audioContext.close();

