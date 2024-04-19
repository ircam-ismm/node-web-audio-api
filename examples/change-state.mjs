import { AudioContext } from '../index.mjs';

console.warn('[incomplete example]');

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

console.log('Context state - %s', audioContext.state);

audioContext.addEventListener('statechange', event => {
  console.log('addEventListener (called second):', event);
});

audioContext.onstatechange = event => {
  console.log('onstatechange (called first):', event);
};

// const sine = audioContext.createOscillator();
// sine.connect(audioContext.destination);
// sine.frequency.value = 200;
// sine.start();

console.log('> Playback for 1 seconds');
await new Promise(resolve => setTimeout(resolve, 1000));

console.log('> Pause audioContext for 1 seconds');
console.log('Context state before suspend - %s', audioContext.state);
await audioContext.suspend();
console.log('Context state after suspend - %s', audioContext.state);

await new Promise(resolve => setTimeout(resolve, 1000));

console.log('> Resume audioContext for 1 seconds');
console.log('Context state before resume - %s', audioContext.state);
await audioContext.resume();
console.log('Context state after resume - %s', audioContext.state);

await new Promise(resolve => setTimeout(resolve, 1000));

// Closing the audioContext should halt the media stream source
console.log('> Close audioContext');
console.log('Context state before close - %s', audioContext.state);
await audioContext.close();
console.log('Context state after close - %s', audioContext.state);

console.log('Process will exit now...');

