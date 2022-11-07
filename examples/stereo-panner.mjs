import { AudioContext, StereoPannerNode } from '../index.mjs';

const context = new AudioContext();

const pan = new StereoPannerNode(context, { channelCount: 1 });

// pipe 2 oscillator into two panner, one on each side of the stereo image
// inverse the direction of the panning every 4 second

// create a stereo panner
const panner1 = context.createStereoPanner();
let pan1 = -1.;
panner1.channelCount = 1;
panner1.connect(context.destination);
panner1.pan.value = pan1;
// create an oscillator
const osc1 = context.createOscillator();
osc1.connect(panner1);
osc1.frequency.value = 200.;
osc1.start();

// create a stereo panner for mono input
const panner2 = context.createStereoPanner();
let pan2 = 1.;
panner2.channelCount = 1;
panner2.connect(context.destination);
panner2.pan.value = pan2;
// create an oscillator
const osc2 = context.createOscillator();
osc2.connect(panner2);
osc2.frequency.value = 300.;
osc2.start();

setInterval(function loop() {
  // reverse the stereo image
  const now = context.currentTime;

  panner1.pan.setValueAtTime(pan1, now);
  pan1 *= -1;
  panner1.pan.linearRampToValueAtTime(pan1, now + 1.);

  panner2.pan.setValueAtTime(pan2, now);
  pan2 *= -1;
  panner2.pan.linearRampToValueAtTime(pan2, now + 1.);
}, 4 * 1000);
