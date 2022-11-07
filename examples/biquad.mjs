import path from 'node:path';
import { AudioContext, load } from '../index.mjs';

const context = new AudioContext();

// setup background music:
// read from local file
const file = load(path.join(process.cwd(), 'samples', 'think-stereo-48000.wav'));
const buffer = await context.decodeAudioData(file);
let now = context.currentTime;

console.log("> smoothly open low-pass filter for 10 sec");
// create a lowpass filter (default)
const biquad = context.createBiquadFilter();
biquad.connect(context.destination);
biquad.frequency.value = 10.;
biquad.frequency.exponentialRampToValueAtTime(10000., now + 10.);

// pipe the audio buffer source into the lowpass filter
const src = context.createBufferSource();
src.connect(biquad);
src.buffer = buffer;
src.loop = true;
src.start();

const frequencyHz = new Float32Array([250., 500.0, 750.0, 1000., 1500.0, 2000.0, 4000.0]);
const magResponse = new Float32Array(frequencyHz.length);
const phaseResponse = new Float32Array(frequencyHz.length);

biquad.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
console.log("=================================");
console.log("Biquad filter frequency response:");
console.log("=================================");
console.log("Cutoff freq -- %f Hz", biquad.frequency.value);
console.log("Gain -- %f", biquad.gain.value);
console.log("Q factor -- %f", biquad.Q.value);
console.log("---------------------------------");
frequencyHz.forEach((freq, index) => {
    console.log(
        "%f Hz --> %f dB",
        freq,
        20.0 * Math.log10(magResponse[index])
    );
});
console.log("---------------------------------");

await new Promise(resolve => setTimeout(resolve, 5 * 1000));

biquad.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
console.log("=================================");
console.log("Biquad filter frequency response:");
console.log("=================================");
console.log("Cutoff freq -- %f Hz", biquad.frequency.value);
console.log("Gain -- %f", biquad.gain.value);
console.log("Q factor -- %f", biquad.Q.value);
console.log("---------------------------------");
frequencyHz.forEach((freq, index) => {
    console.log(
        "%f Hz --> %f dB",
        freq,
        20.0 * Math.log10(magResponse[index])
    );
});
console.log("---------------------------------");

await new Promise(resolve => setTimeout(resolve, 5 * 1000));

biquad.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
console.log("=================================");
console.log("Biquad filter frequency response:");
console.log("=================================");
console.log("Cutoff freq -- %f Hz", biquad.frequency.value);
console.log("Gain -- %f", biquad.gain.value);
console.log("Q factor -- %f", biquad.Q.value);
console.log("---------------------------------");
frequencyHz.forEach((freq, index) => {
    console.log(
        "%f Hz --> %f dB",
        freq,
        20.0 * Math.log10(magResponse[index])
    );
});
console.log("---------------------------------");

now = context.currentTime;
biquad.frequency.exponentialRampToValueAtTime(10., now + 10.);

await new Promise(resolve => setTimeout(resolve, 5 * 1000));

biquad.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
console.log("=================================");
console.log("Biquad filter frequency response:");
console.log("=================================");
console.log("Cutoff freq -- %f Hz", biquad.frequency.value);
console.log("Gain -- %f", biquad.gain.value);
console.log("Q factor -- %f", biquad.Q.value);
console.log("---------------------------------");
frequencyHz.forEach((freq, index) => {
    console.log(
        "%f Hz --> %f dB",
        freq,
        20.0 * Math.log10(magResponse[index])
    );
});
console.log("---------------------------------");

await new Promise(resolve => setTimeout(resolve, 5 * 1000));

biquad.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
console.log("=================================");
console.log("Biquad filter frequency response:");
console.log("=================================");
console.log("Cutoff freq -- %f Hz", biquad.frequency.value);
console.log("Gain -- %f", biquad.gain.value);
console.log("Q factor -- %f", biquad.Q.value);
console.log("---------------------------------");
frequencyHz.forEach((freq, index) => {
    console.log(
        "%f Hz --> %f dB",
        freq,
        20.0 * Math.log10(magResponse[index])
    );
});
console.log("---------------------------------");

process.exit(0);
