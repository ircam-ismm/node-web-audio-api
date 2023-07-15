import { AudioContext } from 'node-web-audio-api';

// check that multichannel is prerly handled
//
// you can test this without a soundcard for example by using the blackhole driver
// https://github.com/ExistentialAudio/BlackHole
// - make it as the default output
// - then use blackhole as input in another program to check the script output
// - see multichannel.maxpat if you have Max installed (@todo - make a Pd version)

const audioContext = new AudioContext();
const numChannels = 8;

audioContext.destination.channelCount = numChannels;
// this throws but should not (cf. https://github.com/orottier/web-audio-api-rs/pull/319)
// audioContext.destination.channelCountMode = 'explicit';
audioContext.destination.channelInterpretation = 'discrete';

await audioContext.resume();

const merger = audioContext.createChannelMerger(numChannels);
// this throws but it's in the spec (neither Chrome nor Firefox seems to follow the spec here)
// merger.channelCountMode = 'explicit';
merger.channelInterpretation = 'discrete';
merger.connect(audioContext.destination);

let outputChannel = 0;

setInterval(() => {
  console.log('output in channel', outputChannel);

  const osc = audioContext.createOscillator();
  osc.connect(merger, 0, outputChannel);
  osc.frequency.value = 200;
  osc.start();
  osc.stop(audioContext.currentTime + 1);

  outputChannel = (outputChannel + 1) % numChannels;
}, 1000);

