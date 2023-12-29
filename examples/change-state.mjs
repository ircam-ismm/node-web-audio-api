import { AudioContext } from '../index.mjs';

console.warn('[incomplete example]');

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

console.log('Context state - %s', audioContext.state);

audioContext.addEventListener('statechange', event => {
  // should be called second
  console.log('addEventListener', event);
});

audioContext.onstatechange = event => {
  // should be called first
  console.log('onstatechange', event);
};

const sine = audioContext.createOscillator();
sine.connect(audioContext.destination);
sine.frequency.value = 200;
sine.start();


// let mic = Microphone::default();
// // register as media element in the audio audioContext
// let background = audioContext.create_media_stream_source(mic.stream());
// // connect the node to the destination node (speakers)
// background.connect(&audioContext.destination());

// // The Microphone will continue to run when either,
// // - the struct is still alive in the control thread
// // - the media stream is active in the render thread
// //
// // Let's drop it from the control thread so it's lifetime is bound by the render thread
// drop(mic);

console.log('> Playback for 2 seconds');
await new Promise(resolve => setTimeout(resolve, 1 * 1000));

console.log('> Pause audioContext for 2 seconds');
console.log('Context state before suspend - %s', audioContext.state);
await audioContext.suspend();
console.log('Context state after suspend - %s', audioContext.state);

await new Promise(resolve => setTimeout(resolve, 1 * 1000));

// console.log('> Resume audioContext for 2 seconds');
// console.log('Context state before resume - %s', audioContext.state);
// await audioContext.resume();
// console.log('Context state after resume - %s', audioContext.state);

// await new Promise(resolve => setTimeout(resolve, 2 * 1000));

// Closing the audioContext should halt the media stream source
console.log('> Close audioContext');
console.log('Context state before close - %s', audioContext.state);
await audioContext.close();
console.log('Context state after close - %s', audioContext.state);

console.log('Process will exit now...');

