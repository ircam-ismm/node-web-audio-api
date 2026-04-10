import path from 'node:path';
import fs from 'node:fs';
import { Scheduler } from '@ircam/sc-scheduling';
import { AudioBufferSourceNode, AudioContext, GainNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const scheduler = new Scheduler(() => audioContext.currentTime);

const arrayBuffer = fs.readFileSync(path.join('examples', 'samples', 'sample.wav')).buffer;
const buffer = await audioContext.decodeAudioData(arrayBuffer);

const period = 0.05;
const grainDuration = 0.2;
let incr = period / 2;
let position = 0;

const engine = (currentTime) => {
  currentTime = Math.max(currentTime, audioContext.currentTime);

  if (
    position + incr > buffer.duration - 2 * grainDuration
    || position + incr < 0
  ) {
    incr *= -1;
  }

  const now = currentTime + Math.random() * 0.005;

    // add bit of random
  const detuneRange = 10;
  const detune = Math.random() * detuneRange - (detuneRange / 2);

  const src = new AudioBufferSourceNode(audioContext, { buffer, detune });
  const env = new GainNode(audioContext, { gain: 0 });
  src.connect(env).connect(audioContext.destination);
;

  env.gain
    .setValueAtTime(0, now)
    .linearRampToValueAtTime(1, now + grainDuration / 2)
    .linearRampToValueAtTime(0, now + grainDuration);

  src.start(now, position);
  src.stop(now + grainDuration);

  position += incr;

  return currentTime + period;
};

scheduler.add(engine);
