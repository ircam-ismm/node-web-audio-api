import { AudioContext } from '../index.mjs';

const audioContext = new AudioContext();

// use merger to pipe oscillators to right and left channels
const merger = audioContext.createChannelMerger(2);
merger.connect(audioContext.destination);

// left branch
const gainLeft = audioContext.createGain();
gainLeft.gain.value = 0.;
gainLeft.connect(merger, 0, 0);

const srcLeft = audioContext.createOscillator();
srcLeft.frequency.value = 200.;
srcLeft.connect(gainLeft);
srcLeft.start();

// right branch
const gainRight = audioContext.createGain();
gainRight.gain.value = 0.;
gainRight.connect(merger, 0, 1);

const srcRight = audioContext.createOscillator();
srcRight.frequency.value = 300.;
srcRight.connect(gainRight);
srcRight.start();

// control both left and right gains with constant source
const constantSource = audioContext.createConstantSource();
constantSource.offset.value = 0.;
constantSource.connect(gainLeft.gain);
constantSource.connect(gainRight.gain);
constantSource.start();

let target = 0.;

(function loop() {
  const now = audioContext.currentTime;
  constantSource.offset.setTargetAtTime(target, now, 0.1);

  target = 1 - target;

  setTimeout(loop, 1000);
}());

