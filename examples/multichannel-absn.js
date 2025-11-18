import path from 'node:path';
import fs from 'node:fs';
import {
  sleep,
} from '@ircam/sc-utils';
import { AudioContext } from '../index.mjs';

// Example of multichannel routing, for now the library can only handle up to
// 32 channels.
//
// The example can be tested with a virtual soundcard such as Blackhole
// https://github.com/ExistentialAudio/BlackHole
// - make it as the default system output
// - then use blackhole as input in another program to check the program output
// (see `multichannel.maxpat` if you have Max installed, @todo make a Pd version)

const audioContext = new AudioContext();

const filepath = path.join('examples', 'samples', '6-chans-pink.wav');
// const filepath = path.join('examples', 'samples', '32-chans-silent.wav');
const arrayBuffer = fs.readFileSync(filepath).buffer;
const buffer = await audioContext.decodeAudioData(arrayBuffer);

console.log('> Max channel count:', audioContext.destination.maxChannelCount);
console.log('> Buffer numberOfChannels:', buffer.numberOfChannels);

audioContext.destination.channelCount = buffer.numberOfChannels;
audioContext.destination.channelInterpretation = 'discrete';

await audioContext.resume();

const src = audioContext.createBufferSource();
src.buffer = buffer;
src.loop = true;
src.connect(audioContext.destination);
src.start();

await sleep(10);
await audioContext.close();

