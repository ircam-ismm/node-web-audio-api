import { AudioContext } from '../index.mjs';

// Example of multichannel routing.
//
// The example can be tested with a virtual soundcard such as Blackhole
// https://github.com/ExistentialAudio/BlackHole
// - make it as the default system output
// - then use blackhole as input in another program to check the program output
// (see `multichannel.maxpat` if you have Max installed, @todo make a Pd version)

const audioContext = new AudioContext();

console.log('> Max channel count:', audioContext.destination.maxChannelCount);

const numChannels = 8;

if (audioContext.destination.maxChannelCount < numChannels) {
  console.log(`This example requires an output device with at least ${numChannels} channels`);
  process.exit();
}

audioContext.destination.channelCount = numChannels;
audioContext.destination.channelInterpretation = 'discrete';

await audioContext.resume();

const merger = audioContext.createChannelMerger(numChannels);
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
