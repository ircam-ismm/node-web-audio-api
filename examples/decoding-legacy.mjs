import fs from 'node:fs';
import path from 'node:path';
import { AudioContext, OfflineAudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const offlineContext = new OfflineAudioContext({
  numberOfChannels: 1,
  length: 1,
  sampleRate: audioContext.sampleRate
});

const okFile = path.join('examples', 'samples', 'sample.wav');
const errFile = path.join('examples', 'samples', 'corrupt.wav');

function decodeSuccess(buffer) {
  console.log(`decodeSuccess`);
  const src = audioContext.createBufferSource();
  src.buffer = buffer;
  src.connect(audioContext.destination);
  src.start();
}

function decodeError(err) {
  console.log(`decodeError callback: ${err.message}`);
}

{
  // audioContext decode success
  const okArrayBuffer = fs.readFileSync(okFile).buffer;
  audioContext.decodeAudioData(okArrayBuffer, decodeSuccess, decodeError);
  // audioContext decode error
  const errArrayBuffer = fs.readFileSync(errFile).buffer;
  audioContext.decodeAudioData(errArrayBuffer, decodeSuccess, decodeError);
}

await new Promise(resolve => setTimeout(resolve, 3000));

{
  // offlineContext decode success
  const okArrayBuffer = fs.readFileSync(okFile).buffer;
  offlineContext.decodeAudioData(okArrayBuffer, decodeSuccess, decodeError);
  // offlineContext decode error
  const errArrayBuffer = fs.readFileSync(errFile).buffer;
  offlineContext.decodeAudioData(errArrayBuffer, decodeSuccess, decodeError);
}

await new Promise(resolve => setTimeout(resolve, 3000));
await audioContext.close();
