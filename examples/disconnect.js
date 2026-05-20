import { AudioContext } from '../index.mjs';
import { sleep } from '@ircam/sc-utils';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const gain = audioContext.createGain();
gain.connect(audioContext.destination);

const osc = audioContext.createOscillator();
osc.start();

const mod = audioContext.createOscillator();
mod.frequency.value = 2;
mod.start();
const amp = audioContext.createGain();
amp.gain.value = 100;
mod.connect(amp);

console.log('# AudioNode');
osc.connect(gain);
await sleep(1);

console.log('undefined disconnect ();');
osc.disconnect();

await sleep(1);
osc.connect(gain);
await sleep(1);

console.log('undefined disconnect (unsigned long output);');
osc.disconnect(0);

await sleep(1);
osc.connect(gain);
await sleep(1);

console.log('undefined disconnect (AudioNode destinationNode);');
osc.disconnect(gain);

await sleep(1);
osc.connect(gain);
await sleep(1);

console.log('undefined disconnect (AudioNode destinationNode, unsigned long output);');
osc.disconnect(gain, 0);

await sleep(1);
osc.connect(gain);
await sleep(1);

console.log('undefined disconnect (AudioNode destinationNode, unsigned long output, unsigned long input);');
osc.disconnect(gain, 0, 0);

await sleep(1);
console.log('# AudioParam');
osc.connect(gain);
amp.connect(osc.frequency);
await sleep(1);

console.log('undefined disconnect (AudioParam destinationParam);');
amp.disconnect(osc.frequency);

await sleep(1);
amp.connect(osc.frequency);
await sleep(1);

console.log('undefined disconnect (AudioParam destinationParam, unsigned long output);');
amp.disconnect(osc.frequency, 0);

await sleep(1);

await audioContext.close();
