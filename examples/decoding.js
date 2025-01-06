import fs from 'node:fs';
import path from 'node:path';
import { AudioContext } from '../index.mjs';

const files = [
  path.join('examples', 'samples', 'sample-faulty.wav'),
  path.join('examples', 'samples', 'sample.wav'),
  path.join('examples', 'samples', 'sample.flac'),
  path.join('examples', 'samples', 'sample.ogg'),
  path.join('examples', 'samples', 'sample.mp3'),
  // cannot decode, format not supported or file corrupted
  path.join('examples', 'samples', 'empty_2c.wav'),
  path.join('examples', 'samples', 'corrupt.wav'),
  path.join('examples', 'samples', 'sample.aiff'),
  path.join('examples', 'samples', 'sample.webm'), // 48kHz,
];

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

for (let filepath of files) {
  console.log('> --------------------------------');

  try {
    const arrayBuffer = fs.readFileSync(filepath).buffer;
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    console.log('> playing file: %s', filepath);
    console.log('> duration: %s', buffer.duration);
    console.log('> length: %s', buffer.length);
    console.log('> channels: %s', buffer.numberOfChannels);
    console.log('> sample rate: %s', buffer.sampleRate);
    console.log('> --------------------------------');

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer;
    src.start();

    await new Promise(resolve => setTimeout(resolve, 4 * 1000));
  } catch (err) {
    console.log('> Error decoding audio file: %s', filepath);
    console.log(err);
    console.log('> --------------------------------');

    await new Promise(resolve => setTimeout(resolve, 1 * 1000));
  }
}

await audioContext.close();
