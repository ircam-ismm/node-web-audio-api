// polyfill must be loaded first
import '#node-web-audio-api-polyfill';
import { sleep } from '@ircam/sc-utils';
import * as Tone from 'tone';

const audioContext = new window.AudioContext();
Tone.setContext(audioContext);

// Example adapted from https://tonejs.github.io/#scheduling
const synthA = new Tone.FMSynth().toDestination();
const synthB = new Tone.AMSynth().toDestination();
//play a note every quarter-note
new Tone.Loop((time) => {
  synthA.triggerAttackRelease('C2', '8n', time);
}, '4n').start(0);
//play another note every off quarter-note, by starting it '8n'
new Tone.Loop((time) => {
  synthB.triggerAttackRelease('C4', '8n', time);
}, '4n').start('8n');
// all loops start when the Transport is started
Tone.getTransport().start();
// ramp up to 800 bpm over 10 seconds
Tone.getTransport().bpm.rampTo(800, 10);

await sleep(10);
// don't understand how to properly stop tone.js, so let's be radical...
process.exit(0);
