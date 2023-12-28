import path from 'node:path';
import fs from 'node:fs';
import readline from 'readline';
import { AudioContext, mediaDevices } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const file = fs.readFileSync(path.join('examples', 'samples', 'sample.wav')).buffer;
const buffer = await audioContext.decodeAudioData(file);

const src = audioContext.createBufferSource();
src.buffer = buffer;
src.loop = true;
src.connect(audioContext.destination);
src.start();

const deviceList = await mediaDevices.enumerateDevices();
const audioOutput = deviceList.filter(d => d.kind === 'audiooutput');

console.log('');
audioOutput.map(d => `- id: ${d.deviceId} - label: ${d.label}`).map(l => console.log(l));
console.log('');

const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

(function selectSinkId() {
  prompt.question(`+ select output deviceId:
> `, deviceId => {
    audioContext.setSinkId(deviceId);
    selectSinkId();
  });
}());
