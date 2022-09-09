import webaudioapi from '../index.js';
const { AudioContext } = webaudioapi;

const audioContext = new AudioContext();

const modulated = audioContext.createGain(); // the gain that will be modulated [0, 1]
modulated.connect(audioContext.destination);
modulated.gain.value = 0.5;

const carrier = audioContext.createOscillator();
carrier.connect(modulated);
carrier.frequency.value = 300;

const depth = audioContext.createGain();
depth.connect(modulated.gain);
depth.gain.value = 0.5;

const modulator = audioContext.createOscillator();
modulator.connect(depth);
modulator.frequency.value = 1.;

modulator.start();
carrier.start();

let flag = 1;

(function loop() {
  const freq = flag * 300;
  const when = audioContext.currentTime + 10;
  modulator.frequency.linearRampToValueAtTime(freq, when);

  flag = 1 - flag;

  setTimeout(loop, 10 * 1000);
}());
