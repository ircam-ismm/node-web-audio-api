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
const numChannels = 8;

audioContext.destination.channelCount = numChannels;
// this throws but should not (cf. https://github.com/orottier/web-audio-api-rs/pull/319)
// audioContext.destination.channelCountMode = 'explicit';
audioContext.destination.channelInterpretation = 'discrete';

println!("> Max channel count: {:?}", audioContext.destination.maxChannelCount);

await audioContext.resume();

const merger = audioContext.createChannelMerger(numChannels);
// this throws but it's in the spec (neither Chrome nor Firefox seems to follow the spec here)
// merger.channelCountMode = 'explicit';
merger.channelInterpretation = 'discrete';
merger.connect(audioContext.destination);

let outputChannel = 0;

setInterval(() => {
  console.log('- output sine in channel', outputChannel);

  const osc = audioContext.createOscillator();
  osc.connect(merger, 0, outputChannel);
  osc.frequency.value = 200;
  osc.start();
  osc.stop(audioContext.currentTime + 1);

  outputChannel = (outputChannel + 1) % numChannels;
}, 1000);
