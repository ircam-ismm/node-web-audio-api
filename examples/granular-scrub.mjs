import path from 'node:path';
import { Scheduler } from 'waves-masters';
import webaudioapi from '../index.js';
const { AudioContext, load } = webaudioapi;

const audioContext = new AudioContext();
const scheduler = new Scheduler(() => audioContext.currentTime);

const file = load(path.join(process.cwd(), 'samples', 'sample.wav'));
const buffer = await audioContext.decodeAudioData(file);

const period = 0.05;
const grainDuration = 0.2;
let incr = period / 2;
let position = 0;

const engine = {
  advanceTime(currentTime) {
    if (
      position + incr > buffer.duration - 2 * grainDuration
      || position + incr < 0
    ) {
      incr *= -1;
    }

    const now = currentTime + Math.random() * 0.005;

    const env = audioContext.createGain();
    env.connect(audioContext.destination);
    env.gain.value = 0;

    const detune = 4;
    const src = audioContext.createBufferSource();
    src.connect(env);
    src.detune.value = Math.random() * 2 * detune - detune;
    src.buffer = buffer;

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + grainDuration / 2);
    env.gain.linearRampToValueAtTime(0, now + grainDuration);

    src.start(now, position);
    src.stop(now + grainDuration);

    position += incr;

    return currentTime + period;
  }
}

scheduler.add(engine);
