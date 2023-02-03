import readline from 'node:readline';
import { OfflineAudioContext, AudioContext, load } from '../index.mjs';
import { getTime } from '@ircam/sc-gettime';
import Table from 'cli-table';

// benchmarks adapted from https://github.com/padenot/webaudio-benchmark

console.clear();

async function loadBuffer(sources, pathname, sampleRate) {
  const context = new OfflineAudioContext(1, 1, sampleRate);

  const file = load(pathname);
  const audioBuffer = await context.decodeAudioData(file);

  sources.push(audioBuffer);
}

function getBuffer(sources, sampleRate, numberOfChannels) {
  return sources.find(buffer => {
    return buffer.sampleRate == sampleRate && buffer.numberOfChannels == numberOfChannels
  });
}

async function benchmark(name, context, results) {
  console.clear();
  console.log(`> Running benchmark: ${name}`)

  const start = getTime();
  const buffer = await context.startRendering();
  const duration = getTime() - start;

  const result = {
    name,
    duration,
    buffer,
  };

  results.push(result);
}


const sources = [];
const results = [];

const DURATION = 120;
const sampleRate = 48000.;

await loadBuffer(sources, "samples/think-mono-38000.wav", 38000.);
await loadBuffer(sources, "samples/think-mono-44100.wav", 44100.);
await loadBuffer(sources, "samples/think-mono-48000.wav", 48000.);
await loadBuffer(sources, "samples/think-stereo-38000.wav", 38000.);
await loadBuffer(sources, "samples/think-stereo-44100.wav", 44100.);
await loadBuffer(sources, "samples/think-stereo-48000.wav", 48000.);

console.log(sources);

// let stdout = stdout().into_raw_mode().unwrap();

// // -------------------------------------------------------
// // benchamarks
// // -------------------------------------------------------
console.log('');

{
  const name = "Baseline (silence)";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  await benchmark(name, context, results);
}

{
  const name = "Simple source test without resampling (Mono)";

  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);
  const source = context.createBufferSource();
  const buf = getBuffer(sources, sampleRate, 1);
  source.buffer = buf;
  source.loop = true;
  source.connect(context.destination);
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Simple source test without resampling (Stereo)";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);
  const source = context.createBufferSource();
  const buf = getBuffer(sources, sampleRate, 2);
  source.buffer = buf;
  source.loop = true;
  source.connect(context.destination);
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Simple source test without resampling (Stereo and positionnal)";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  const panner = context.createPanner();
  panner.connect(context.destination);
  panner.positionX.value = 1.;
  panner.positionY.value = 2.;
  panner.positionZ.value = 3.;
  panner.orientationX.value = 1.;
  panner.orientationY.value = 2.;
  panner.orientationZ.value = 3.;

  const source = context.createBufferSource();
  source.connect(panner);

  const buf = getBuffer(sources, sampleRate, 2);
  source.buffer = buf;
  source.loop = true;
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Simple source test with resampling (Mono)";

  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);
  const source = context.createBufferSource();
  const buf = getBuffer(sources, 38000., 1);
  source.buffer = buf;
  source.loop = true;
  source.connect(context.destination);
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Simple source test with resampling (Stereo)";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);
  const source = context.createBufferSource();
  const buf = getBuffer(sources, 38000., 2);
  source.buffer = buf;
  source.loop = true;
  source.connect(context.destination);
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Simple source test with resampling (Stereo and positionnal)";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  const panner = context.createPanner();
  panner.connect(context.destination);
  panner.positionX.value = 1.;
  panner.positionY.value = 2.;
  panner.positionZ.value = 3.;
  panner.orientationX.value = 1.;
  panner.orientationY.value = 2.;
  panner.orientationZ.value = 3.;

  const source = context.createBufferSource();
  source.connect(panner);

  const buf = getBuffer(sources, 38000., 2);
  source.buffer = buf;
  source.loop = true;
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Upmix without resampling (Mono -> Stereo)";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);
  const source = context.createBufferSource();
  const buf = getBuffer(sources, sampleRate, 1);
  source.buffer = buf;
  source.loop = true;
  source.connect(context.destination);
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Downmix without resampling (Stereo -> Mono)";

  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);
  const source = context.createBufferSource();
  const buf = getBuffer(sources, sampleRate, 2);
  source.buffer = buf;
  source.loop = true;
  source.connect(context.destination);
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "Simple mixing (100x same buffer) - be careful w/ volume here!";

  const adjusted_duration = DURATION / 4;
  const context =
      new OfflineAudioContext(1, adjusted_duration * sampleRate, sampleRate);

  for (let i = 0; i < 100; i++) {
    const source = context.createBufferSource();
    const buf = getBuffer(sources, 38000., 1);
    source.buffer = buf;
    source.loop = true;
    source.connect(context.destination);
    source.start();
  }

  await benchmark(name, context, results);
}

{
  const name = "Simple mixing (100 different buffers) - be careful w/ volume here!";

  const adjusted_duration = DURATION / 4;
  const context = new OfflineAudioContext(1, adjusted_duration * sampleRate, sampleRate);
  const reference = getBuffer(sources, 38000., 1);
  const channelData = reference.getChannelData(0);

  for (let i = 0; i < 100; i++) {
    const buffer = context.createBuffer(1, reference.length, 38000.);
    buffer.copyToChannel(channelData, 0);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(context.destination);
    source.start();
  }

  await benchmark(name, context, results);
}

{
  const name = "Simple mixing with gains";

  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);

  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.value = -1.;

  const gains_i = [];

  for (let i = 0; i < 4; i++) {
    const gain_i = context.createGain();
    gain_i.connect(gain);
    gain_i.gain.value = 0.25;
    gains_i.push(gain_i);
  }

  for (let i = 0; i < 2; i++) {
    const buf = getBuffer(sources, 38000., 1);

    const source = context.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    source.start();

    gains_i.forEach(gain_i => {
      const gain_ij = context.createGain();
      gain_ij.gain.value = 0.5;
      gain_ij.connect(gain_i);
      source.connect(gain_ij);
    });
  }

  await benchmark(name, context, results);
}

{
    const name = "Convolution reverb";

    const adjusted_duration = DURATION / 8.;
    const length = (adjusted_duration * sampleRate);
    const context = new OfflineAudioContext(1, length, sampleRate);
    const buf = getBuffer(sources, sampleRate, 1);

    const decay = 10.;
    const duration = 4.;
    const len = duration * sampleRate;
    const buffer = context.createBuffer(2, len, sampleRate);

    const iL = new Float32Array(len);
    const iR = new Float32Array(len);

    for (let i = 0; i < len; i++) {
      iL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      iR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }

    buffer.copyToChannel(iL, 0);
    buffer.copyToChannel(iR, 1);

    const convolver = context.createConvolver();
    convolver.buffer = buffer;
    convolver.connect(context.destination);

    const source = context.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    source.start();
    source.connect(convolver);

    await benchmark(name, context, results);
}

{
  const name = "Granular synthesis";

  const adjusted_duration = DURATION / 16.;
  const length = (adjusted_duration * sampleRate);
  const context = new OfflineAudioContext(1, length, sampleRate);
  const buffer = getBuffer(sources, sampleRate, 1);
  let offset = 0.;

  // this 1500 sources...
  while (offset < adjusted_duration) {
    const env = context.createGain();
    env.connect(context.destination);

    const src = context.createBufferSource();
    src.connect(env);
    src.buffer = buffer;

    const randStart = Math.random() * 0.5;
    const randDuration = Math.random() * 0.999;
    const start = offset * randStart;
    const end = start + 0.005 * randDuration;
    const start_release = Math.max(offset + end - start, 0.);

    env.gain.setValueAtTime(0., offset);
    env.gain.linearRampToValueAtTime(0.5, offset + 0.005);
    env.gain.setValueAtTime(0.5, start_release);
    env.gain.linearRampToValueAtTime(0., start_release + 0.05);

    src.start(offset, start, end);

    offset += 0.005;
  }

  await benchmark(name, context, results);
}

{
  const name = "Synth (Sawtooth with Envelope)";

  const sampleRate = 44100.;
  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);
  let offset = 0.;

  const duration = DURATION;

  while (offset < duration) {
    const env = context.createGain();
    env.connect(context.destination);

    const osc = context.createOscillator();
    osc.connect(env);
    osc.type = 'sawtooth';
    osc.frequency.value = 110.;

    env.gain.setValueAtTime(0., 0.);
    env.gain.setValueAtTime(0.5, offset);
    env.gain.setTargetAtTime(0., offset + 0.01, 0.1);
    osc.start(offset);
    osc.stop(offset + 1.); // why not 0.1 ?

    offset += 140. / 60. / 4.; // 140 bpm (?)
  }

  await benchmark(name, context, results);
}

{
  const name = "Synth (Sawtooth with gain - no automation)";

  const sampleRate = 44100.;
  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);
  let offset = 0.;

  const duration = DURATION;

  while (offset < duration) {
    const env = context.createGain();
    env.connect(context.destination);

    const osc = context.createOscillator();
    osc.connect(env);
    osc.type = 'sawtooth';
    osc.frequency.value = 110.;
    osc.start(offset);
    osc.stop(offset + 1.); // why not 0.1 ?

    offset += 140. / 60. / 4.; // 140 bpm (?)
  }

  await benchmark(name, context, results);
}

{
  const name = "Synth (Sawtooth without gain)";

  const sampleRate = 44100.;
  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);
  let offset = 0.;

  const duration = DURATION;

  while (offset < duration) {
    const osc = context.createOscillator();
    osc.connect(context.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = 110.;
    osc.start(offset);
    osc.stop(offset + 1.); // why not 0.1 ?

    offset += 140. / 60. / 4.; // 140 bpm (?)
  }

  await benchmark(name, context, results);
}

{
  const name = "Substractive Synth";

  const sampleRate = 44100.;
  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);
  let offset = 0.;

  const filter = context.createBiquadFilter();
  filter.connect(context.destination);
  filter.frequency.setValueAtTime(0., 0.);
  filter.Q.setValueAtTime(20., 0.);

  const env = context.createGain();
  env.connect(filter);
  env.gain.setValueAtTime(0., 0.);

  const osc = context.createOscillator();
  osc.connect(env);
  osc.type = 'sawtooth';
  osc.frequency.value = 110.;
  osc.start();

  const duration = DURATION;

  while (offset < duration) {
    env.gain.setValueAtTime(1., offset);
    env.gain.setTargetAtTime(0., offset, 0.1);

    filter.frequency.setValueAtTime(0., offset);
    filter.frequency.setTargetAtTime(3500., offset, 0.03);

    offset += 140. / 60. / 16.; // 140 bpm (?)
  }

  await benchmark(name, context, results);
}

{
  const name = "Stereo panning";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  const panner = context.createStereoPanner();
  panner.connect(context.destination);
  panner.pan.value = 0.1;

  const src = context.createBufferSource();
  const buffer = getBuffer(sources, sampleRate, 2);
  src.connect(panner);
  src.buffer = buffer;
  src.loop = true;
  src.start();

  await benchmark(name, context, results);
}

{
  const name = "Stereo panning with automation";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  const panner = context.createStereoPanner();
  panner.connect(context.destination);
  panner.pan.setValueAtTime(-1., 0.);
  panner.pan.setValueAtTime(0.2, 0.5);

  const src = context.createBufferSource();
  const buffer = getBuffer(sources, sampleRate, 2);
  src.connect(panner);
  src.buffer = buffer;
  src.loop = true;
  src.start();

  await benchmark(name, context, results);
}

{
  const name = "Sawtooth with automation";

  const context = new OfflineAudioContext(1, DURATION * sampleRate, sampleRate);

  const osc = context.createOscillator();
  osc.connect(context.destination);
  osc.type = 'sawtooth';
  osc.frequency.value = 2000.;
  osc.frequency.linearRampToValueAtTime(20., 10.);
  osc.start(0.);

  await benchmark(name, context, results);
}

{
  // derived from "Simple source test without resampling (Stereo)""
  const name = "Stereo source with delay";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  const delay = context.createDelay(1.);
  delay.delayTime.value = 1.;
  delay.connect(context.destination);

  const source = context.createBufferSource();
  const buf = getBuffer(sources, sampleRate, 2);
  source.buffer = buf;
  source.loop = true;
  source.connect(delay);
  source.start();

  await benchmark(name, context, results);
}

{
  const name = "IIR filter";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  // these values correspond to a lowpass filter at 200Hz (calculated from biquad)
  const feedforward = new Float64Array([0.0002029799640409502,0.0004059599280819004,0.0002029799640409502]);
  const feedback = new Float64Array([1.0126964557853775, -1.9991880801438362, 0.9873035442146225]);

  // Create an IIR filter node
  const iir = context.createIIRFilter(feedforward, feedback);
  iir.connect(context.destination);

  const src = context.createBufferSource();
  const buffer = getBuffer(sources, sampleRate, 2);
  src.connect(iir);
  src.buffer = buffer;
  src.loop = true;
  src.start();

  await benchmark(name, context, results);
}

{
  const name = "Biquad filter";

  const context = new OfflineAudioContext(2, DURATION * sampleRate, sampleRate);

  // Create a biquad filter node (defaults to low pass)
  const biquad = context.createBiquadFilter();
  biquad.connect(context.destination);
  biquad.frequency.value = 200.;

  const src = context.createBufferSource();
  const buffer = getBuffer(sources, sampleRate, 2);
  src.connect(biquad);
  src.buffer = buffer;
  src.loop = true;
  src.start();

  await benchmark(name, context, results);
}

console.clear();
console.log('All done!');

// -------------------------------------------------------
// display results
// -------------------------------------------------------

// instantiate
const table = new Table({
    head: ['id', 'name', 'duration (ms)', 'Speedup vs. realtime', 'buffer.duration (s)'],
    colWidths: [10, 40, 15, 15, 15],
});

results.forEach((result, index) => {
  table.push([
    index + 1,
    result.name,
    (result.duration * 1000).toFixed(3),
    (result.buffer.duration / result.duration).toFixed(1),
    result.buffer.duration
  ])
});

console.log(table.toString());

console.log(`
+ Press "q" or "ctrl + c" to quit

+ Type the id of the result you want to listen and press "spacebar" to start/stop playback
`);

const audioContext = new AudioContext();
const stdin = process.stdin;
// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);
// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();
// i don't want binary, do you?
stdin.setEncoding( 'utf8' );
// on any data into stdin
let id = ``;
let src = null;

stdin.on('data', key => {
  // ctrl-c ( end of text )
  if (key === '\u0003') {
    process.exit();
  }

  if (!Number.isNaN(parseInt(key))) {
    id += key;
    process.stdout.write(key);
  }

  if (key == ' ') {
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);

    if (src !== null) {
      src.stop();
    }

    const index = parseInt(id) - 1;

    if (results[index]) {
      id = ``;
      src = audioContext.createBufferSource();
      src.connect(audioContext.destination);
      src.buffer = results[index].buffer;
      src.start();
    }
  }
});

