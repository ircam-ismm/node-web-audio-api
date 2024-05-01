const { isMainThread } = require('node:worker_threads');
const { runAudioWorklet, registerProcessor } = require('./../../index.js');

console.log('Inside Worker!');
console.log('Is main thread', isMainThread);  // Prints 'false'.

class AudioWorkletProcessor { }

runAudioWorklet();
