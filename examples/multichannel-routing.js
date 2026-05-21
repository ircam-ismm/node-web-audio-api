import fs from 'node:fs';
import path from 'node:path';

import {
  AudioContext,
  ChannelMergerNode,
  ChannelSplitterNode,
  AudioBufferSourceNode,
} from '#node-web-audio-api';
import { sleep } from '@ircam/sc-utils';

// This example shows how to route a 6 channel audio file, into a stereo output
// with the following mapping:
// 0 -> 0
// 1 -> 1
// 2 -> 0
// 3 -> 1
// 4 -> 0
// 5 -> 1

const audioContext = new AudioContext();

const arrayBuffer = fs.readFileSync(path.join('examples', 'samples', '6_channels_test.wav')).buffer;
const buffer = await audioContext.decodeAudioData(arrayBuffer);

console.log('> # channels:', buffer.numberOfChannels);
console.log('> duration:', buffer.duration);

const src = new AudioBufferSourceNode(audioContext, { buffer });
const splitter = new ChannelSplitterNode(audioContext, { numberOfOutputs: 6 });
const merger = new ChannelMergerNode(audioContext, { numberOfInputs: 2 });

audioContext.destination.channelCount = 2;
audioContext.destination.channelInterpretation = 'discrete';

src
  .connect(splitter)
  .connect(merger)
  .connect(audioContext.destination);


splitter.connect(merger, 0, 0);
splitter.connect(merger, 1, 1);
splitter.connect(merger, 2, 0);
splitter.connect(merger, 3, 1);
splitter.connect(merger, 4, 0);
splitter.connect(merger, 5, 1);

src.start();

await sleep(buffer.duration);
await audioContext.close();
