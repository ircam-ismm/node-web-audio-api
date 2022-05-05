const { AudioContext, load } = require('../index.js');

const audioContext = new AudioContext();

console.log('AM synth');

const tremolo = audioContext.createGain(); // the gain that will be modulated [0, 1]
tremolo.connect(audioContext.destination);
tremolo.gain.value = 0.5;

// scale mod oscillator to make sure `depth + tremolo` stays in the [0, 1] range
// `depth` should stay between [0, 0.5] -> therefore producing a sine [-0.5, 5]
// `tremolo` should be complementary between [1, 0.5]
const depth = audioContext.createGain();
depth.gain.value = 0.5;
depth.connect(tremolo.gain);

const mod = audioContext.createOscillator();
mod.frequency.value = 2;
mod.connect(depth); //

const carrier = audioContext.createOscillator();
carrier.connect(tremolo);

mod.start();
carrier.start();

// @fix: nodes gets garbage collected somehow so we log one of them to avoid that
setInterval(() => { console.log(tremolo); }, 10 * 1000);
