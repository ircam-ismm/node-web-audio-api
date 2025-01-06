import fs from 'node:fs';
import path from 'node:path';
import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const pathname = path.join('examples', 'samples', 'think-stereo-48000.wav');
const arrayBuffer = fs.readFileSync(pathname).buffer;
const buffer = await audioContext.decodeAudioData(arrayBuffer);

// these values correspond to a lowpass filter at 200Hz (calculated from biquad)
const feedforward = new Float64Array([0.0002029799640409502, 0.0004059599280819004, 0.0002029799640409502]);
const feedback = new Float64Array([1.0126964557853775, -1.9991880801438362, 0.9873035442146225]);
// @todo - for now the API doesn't support raw Arrays
// const feedforward = [0.0002029799640409502, 0.0004059599280819004, 0.0002029799640409502];
// const feedback = [1.0126964557853775, -1.9991880801438362, 0.9873035442146225];

// Create an IIR filter node
const iir = audioContext.createIIRFilter(feedforward, feedback);
iir.connect(audioContext.destination);

// Play buffer and pipe to filter
const src = audioContext.createBufferSource();
src.connect(iir);
src.buffer = buffer;
src.loop = true;
src.start();
