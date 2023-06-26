import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const osc = audioContext.createOscillator();
osc.connect(audioContext.destination);
osc.start();

const intervalTime = 2.;

console.log('Sine');

osc.frequency.linearRampToValueAtTime(880., audioContext.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('Square');

osc.type = 'square';
osc.frequency.linearRampToValueAtTime(440., audioContext.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('Triangle');

osc.type = 'triangle';
osc.frequency.linearRampToValueAtTime(880., audioContext.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('Sawtooth');

osc.type = 'sawtooth';
osc.frequency.linearRampToValueAtTime(440., audioContext.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));
console.log('PeriodicWave');

const real = new Float32Array([0., 0.5, 0.5]);
const imag = new Float32Array([0., 0., 0.]);
const constraints = { disableNormalization: false };

const periodicWave = audioContext.createPeriodicWave(real, imag, constraints);
// const periodicWave = audioContext.createPeriodicWave(real, imag);

osc.setPeriodicWave(periodicWave);
osc.frequency.linearRampToValueAtTime(880., audioContext.currentTime + intervalTime);

await new Promise(resolve => setTimeout(resolve, intervalTime * 1000));

audioContext.close();

