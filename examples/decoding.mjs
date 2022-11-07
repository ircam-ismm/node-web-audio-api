import path from 'node:path';
import { AudioContext, load } from '../index.mjs';

const files = [
    'samples/sample-faulty.wav',
    'samples/sample.wav',
    'samples/sample.flac',
    'samples/sample.ogg',
    'samples/sample.mp3',
    // cannot decode, format not supported or file corrupted
    'samples/empty_2c.wav',
    'samples/corrupt.wav',
    'samples/sample.aiff',
    'samples/sample.webm', // 48kHz,
];

const audioContext = new AudioContext();

for (let filepath of files) {
  console.log('> --------------------------------');

  try {
    const file = load(path.join(process.cwd(), filepath));
    const buffer = await audioContext.decodeAudioData(file);
    console.log(buffer);

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
  } catch(err) {
    console.log('> Error decoding audio file: %s', filepath);
    console.log(err);
    console.log('> --------------------------------');

    await new Promise(resolve => setTimeout(resolve, 1 * 1000));
  }
}

audioContext.close();
