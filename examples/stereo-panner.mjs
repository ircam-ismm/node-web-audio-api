import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

// pipe 2 oscillator into two panner, one on each side of the stereo image
// inverse the direction of the panning every 4 second

// create a stereo panner
const panner1 = audioContext.createStereoPanner();
let pan1 = -1.;
panner1.channelCount = 1;
panner1.connect(audioContext.destination);
panner1.pan.value = pan1;
// create an oscillator
const osc1 = audioContext.createOscillator();
osc1.connect(panner1);
osc1.frequency.value = 200.;
osc1.start();

// create a stereo panner for mono input
const panner2 = audioContext.createStereoPanner();
let pan2 = 1.;
panner2.channelCount = 1;
panner2.connect(audioContext.destination);
panner2.pan.value = pan2;
// create an oscillator
const osc2 = audioContext.createOscillator();
osc2.connect(panner2);
osc2.frequency.value = 300.;
osc2.start();

setInterval(function loop() {
  // reverse the stereo image
  const now = audioContext.currentTime;

  panner1.pan.setValueAtTime(pan1, now);
  pan1 *= -1;
  panner1.pan.linearRampToValueAtTime(pan1, now + 1.);

  panner2.pan.setValueAtTime(pan2, now);
  pan2 *= -1;
  panner2.pan.linearRampToValueAtTime(pan2, now + 1.);
}, 4 * 1000);
