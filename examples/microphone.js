import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

import {
  mediaDevices,
  AudioContext,
  // eslint-disable-next-line no-unused-vars
  MediaStreamAudioSourceNode,
} from '#node-web-audio-api';



console.log('MediaDevices::getUserMedia - mic feedback, be careful with volume...)');

const rl = createInterface({
  input: stdin,
  output: stdout,
});

// choose input
const devices = await mediaDevices.enumerateDevices();
console.log(devices.filter(d => d.kind === 'audioinput'));
const inputId = await rl.question('> Input deviceId (empty for default): ');

const mediaStream = await mediaDevices.getUserMedia({ audio: {
  deviceId: inputId.trim(),
  channelCount: 33, // more than one channel leads to cranky sound for now...
}});

const audioContext = new AudioContext();
await audioContext.resume();

// const source = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
const source = audioContext.createMediaStreamSource(mediaStream); // factory API
source.connect(audioContext.destination);

