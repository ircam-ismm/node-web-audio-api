import webaudioapi from '../index.js';
const { AudioContext } = webaudioapi;

const context = new AudioContext();

// create a 1 second buffer filled with a sine at 200Hz
console.log("> Play sine at 200Hz created manually in an AudioBuffer");

const length = context.sampleRate;
const sample_rate = context.sampleRate;
const buffer = context.createBuffer(1, length, sample_rate);
const sine = new Float32Array();

for (let i = 0; i < length; i++) {
    let phase = i / length * 2. * Math.PI * 200.;
    sine.push(Math.sin(phase));
}

buffer.copyToChannel(sine, 0);

// play the buffer in a loop
const src = context.createBufferSource();
src.buffer = buffer;
src.loop = true;
src.connect(context.destination);
src.start(context.currentTime);
src.stop(context.currentTime + 3.);

await new Promise(resolve => setTimeout(resolve, 3 * 1000));

// play a sine at 200Hz
console.log("> Play sine at 200Hz from an OscillatorNode");

let osc = context.createOscillator();
osc.frequency.value = 200.;
osc.connect(context.destination);
osc.start(context.currentTime);
osc.stop(context.currentTime + 3.);

await new Promise(resolve => setTimeout(resolve, 3.5 * 1000));

process.exit(0);
