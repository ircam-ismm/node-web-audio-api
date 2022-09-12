import path from 'node:path';
import webaudioapi from '../index.js';
const { AudioContext, load } = webaudioapi;

const context = new AudioContext();

const file = load(path.join(process.cwd(), 'samples', 'think-stereo-48000.wav'));
const buffer = await context.decodeAudioData(file);

// these values correspond to a lowpass filter at 200Hz (calculated from biquad)
const feedforward = new Float64Array([0.0002029799640409502, 0.0004059599280819004, 0.0002029799640409502]);
const feedback = new Float64Array([1.0126964557853775, -1.9991880801438362, 0.9873035442146225]);
// @todo - this does not work while it should
// const feedforward = [0.0002029799640409502, 0.0004059599280819004, 0.0002029799640409502];
// const feedback = [1.0126964557853775, -1.9991880801438362, 0.9873035442146225];

// Create an IIR filter node
const iir = context.createIIRFilter(feedforward, feedback);
iir.connect(context.destination);

// Play buffer and pipe to filter
const src = context.createBufferSource();
src.connect(iir);
src.buffer = buffer;
src.loop = true;
src.start();
