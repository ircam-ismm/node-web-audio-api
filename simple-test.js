const { AudioContext, AudioBuffer, OscillatorNode, GainNode, load } = require('./index');

const audioContext = new AudioContext();

// private ctor
// const buffer = new AudioBuffer(false);
// console.log(buffer);

// setInterval(() => {
//   const now = audioContext.currentTime;

//   const env = audioContext.createGain();
//   env.connect(audioContext.destination);
//   env.gain.value = 0;
//   env.gain.setValueAtTime(0, now);
//   env.gain.linearRampToValueAtTime(0.1, now + 0.02);
//   env.gain.exponentialRampToValueAtTime(0.0001, now + 1);

//   const osc = audioContext.createOscillator();
//   osc.frequency.value = 200 + Math.random() * 2800;
//   osc.connect(env);
//   osc.start(now);
//   osc.stop(now + 1);
// }, 100);


const file = load('sample.wav');
console.log(file);
const buffer = audioContext.decodeAudioData(file);
console.log('sampleRate:', buffer.sampleRate);
console.log('duration:', buffer.duration);
console.log('length:', buffer.length);
console.log('numberOfChannels:', buffer.numberOfChannels);

setInterval(() => {
  const src = audioContext.createBufferSource();
  src.connect(audioContext.destination);
  src.buffer = buffer;
  src.start();
}, 1000);
