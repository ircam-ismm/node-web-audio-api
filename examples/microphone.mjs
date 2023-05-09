import { mediaDevices, AudioContext, MediaStreamAudioSourceNode, GainNode } from '../index.mjs';

console.log('MediaDevices::getUserMedia - mic feedback, be careful with volume...)');

const mediaStream = await mediaDevices.getUserMedia({ audio: true });

const audioContext = new AudioContext();
await audioContext.resume();

const source = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
// const source = audioContext.createMediaStreamSource(mediaStream); // factory API
source.connect(audioContext.destination);

