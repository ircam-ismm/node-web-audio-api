import { AudioContext } from '../index.mjs';

console.warn('[incomplete example]');

let context = new AudioContext();
console.log("Context state - %s", context.state);

const sine = context.createOscillator();
sine.connect(context.destination);
sine.frequency.value = 200;
sine.start();


// let mic = Microphone::default();
// // register as media element in the audio context
// let background = context.create_media_stream_source(mic.stream());
// // connect the node to the destination node (speakers)
// background.connect(&context.destination());

// // The Microphone will continue to run when either,
// // - the struct is still alive in the control thread
// // - the media stream is active in the render thread
// //
// // Let's drop it from the control thread so it's lifetime is bound by the render thread
// drop(mic);

console.log("> Playback for 2 seconds");
await new Promise(resolve => setTimeout(resolve, 2 * 1000));

console.log("> Pause context for 2 seconds");
console.log("Context state before suspend - %s", context.state);
await context.suspend();
console.log("Context state after suspend - %s", context.state);

await new Promise(resolve => setTimeout(resolve, 2 * 1000));

console.log("> Resume context for 2 seconds");
console.log("Context state before resume - %s", context.state);
await context.resume();
console.log("Context state after resume - %s", context.state);

await new Promise(resolve => setTimeout(resolve, 2 * 1000));

// Closing the context should halt the media stream source
console.log("> Close context");
console.log("Context state before close - %s", context.state);
await context.close();
console.log("Context state after close - %s", context.state);

console.log('Process will exit now...');

