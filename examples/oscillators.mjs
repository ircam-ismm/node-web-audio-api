import webaudioapi from '../index.js';
const { AudioContext } = webaudioapi;

let context = new AudioContext();

let osc = context.createOscillator();
osc.connect(context.destination);
osc.start();

let intervalTime = 2.;

console.log('Sine');

osc.frequency.linearRampToValueAtTime(880., context.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('Square');

osc.type = 'square';
osc.frequency.linearRampToValueAtTime(440., context.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('Triangle');

osc.type = 'triangle';
osc.frequency.linearRampToValueAtTime(880., context.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('Sawtooth');

osc.type = 'sawtooth';
osc.frequency.linearRampToValueAtTime(440., context.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('PeriodicWave');

const real = new Float32Array([0., 0.5, 0.5]);
const imag = new Float32Array([0., 0., 0.]);
const constraints = { disableNormalization: false };

const periodicWave = context.createPeriodicWave(real, imag, constraints);
// const periodicWave = context.createPeriodicWave(real, imag);

osc.setPeriodicWave(periodicWave);
osc.frequency.linearRampToValueAtTime(880., context.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));

context.close();

