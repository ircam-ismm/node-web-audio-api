import fs from 'node:fs';
import path from 'node:path';
import { AudioContext, OfflineAudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

console.log('> AudioContext sampleRate: %f', audioContext.sampleRate);

{
  console.log('--------------------------------------------------------------');
  console.log('> Case 1: buffers are decoded at right sample rate by context');
  console.log('--------------------------------------------------------------');

  const file38000 = fs.readFileSync(path.join('examples', 'samples', 'sample-38000.wav')).buffer;
  const buffer38000 = await audioContext.decodeAudioData(file38000);

  const file44100 = fs.readFileSync(path.join('examples', 'samples', 'sample-44100.wav')).buffer;
  const buffer44100 = await audioContext.decodeAudioData(file44100);

  const file48000 = fs.readFileSync(path.join('examples', 'samples', 'sample-48000.wav')).buffer;
  const buffer48000 = await audioContext.decodeAudioData(file48000);

  // audio context at default system sample rate
  {
    console.log('+ playing sample-38000.wav - decoded sample rate: %f', buffer38000.sampleRate);

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer38000;
    src.start();
  }

  await new Promise(resolve => setTimeout(resolve, 3500));

  {
    console.log('+ playing sample-44100.wav - decoded sample rate: %f', buffer44100.sampleRate);

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer44100;
    src.start();
  }

  await new Promise(resolve => setTimeout(resolve, 3500));

  {
    console.log('+ playing sample-48000.wav - decoded sample rate: %f', buffer48000.sampleRate);

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer48000;
    src.start();
  }

  await new Promise(resolve => setTimeout(resolve, 3500));
}

{
  console.log('--------------------------------------------------------------');
  console.log('> Case 2: buffers are decoded with another sample rate, then resampled by the AudioBufferSourceNode');
  console.log('--------------------------------------------------------------');

  const audioContext38000 = new AudioContext({
    sampleRate: 38000.,
    latencyHint: 'interactive',
  });
  const file38000 = fs.readFileSync(path.join('examples', 'samples', 'sample-38000.wav')).buffer;
  const buffer38000 = await audioContext38000.decodeAudioData(file38000);
  await audioContext38000.close();

  const audioContext44100 = new AudioContext({
    sampleRate: 44100.,
    latencyHint: 'interactive',
  });
  const file44100 = fs.readFileSync(path.join('examples', 'samples', 'sample-44100.wav')).buffer;
  const buffer44100 = await audioContext44100.decodeAudioData(file44100);
  await audioContext44100.close();

  const audioContext48000 = new AudioContext({
    sampleRate: 48000.,
    latencyHint: 'interactive',
  });
  const file48000 = fs.readFileSync(path.join('examples', 'samples', 'sample-48000.wav')).buffer;
  const buffer48000 = await audioContext48000.decodeAudioData(file48000);
  await audioContext48000.close();

  {
    // audio context at default system sample rate
    console.log('+ playing sample-38000.wav - decoded sample rate: %f', buffer38000.sampleRate);

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer38000;
    src.start();
  }

  await new Promise(resolve => setTimeout(resolve, 3500));

  {
    console.log('+ playing sample-44100.wav - decoded sample rate: %f', buffer44100.sampleRate);

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer44100;
    src.start();
  }

  await new Promise(resolve => setTimeout(resolve, 3500));

  {
    console.log('+ playing sample-48000.wav - decoded sample rate: %f', buffer48000.sampleRate);

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer48000;
    src.start();
  }

  await new Promise(resolve => setTimeout(resolve, 3500));
}

await audioContext.close();
