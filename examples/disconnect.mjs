import { AudioContext } from '../index.mjs';

const audioContext = new AudioContext();

const gain = audioContext.createGain();
gain.connect(audioContext.destination);

const osc = audioContext.createOscillator();
osc.connect(gain);
osc.start();

await new Promise(resolve => setTimeout(resolve, 1000));

console.log('osc.disconnect()');
osc.disconnect();

await new Promise(resolve => setTimeout(resolve, 1000));

console.log('osc reconnect to gain');
osc.connect(gain);

await new Promise(resolve => setTimeout(resolve, 1000));

console.log('osc.disconnect(gain)');
osc.disconnect(gain);

await audioContext.close();
