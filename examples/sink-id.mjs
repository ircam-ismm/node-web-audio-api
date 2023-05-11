import path from 'node:path';
import fs from 'node:fs';
import readline from 'readline';
import { AudioContext, load, mediaDevices } from '../index.mjs';

const context = new AudioContext();
const file = await load(path.join(process.cwd(), 'samples', 'sample.wav'));
const buffer = await context.decodeAudioData(file);

const src = context.createBufferSource();
src.buffer = buffer;
src.loop = true;
src.connect(context.destination);
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
    context.setSinkId(deviceId);
    selectSinkId();
  });
}());
