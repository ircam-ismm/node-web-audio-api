import fs from 'node:fs';
import path from 'node:path';
import { AudioContext, AudioBufferSourceNode } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const buffer = fs.readFileSync(path.join('examples', 'samples', 'sample.wav')).buffer;
const audioBuffer = await audioContext.decodeAudioData(buffer);

{
  const src = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
  src.connect(audioContext.destination);
  // src.buffer = audioBuffer;
  src.addEventListener('ended', (e) => {
    console.log('> onended', e);
  });

  src.start();
}

// test that if the context is closed before ended event is trigerred,
// the underlying tsfn is properly aborted
const testAbort = true;

if (testAbort) {
  await new Promise(resolve => setTimeout(resolve, 1000));
} else {
  await new Promise(resolve => setTimeout(resolve, 5 * 1000));
}

console.log('closing context');
await audioContext.close();
