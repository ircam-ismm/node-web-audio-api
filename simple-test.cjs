const { AudioContext } = require('./index.js');

const audioContext = new AudioContext();
process.audioContext = audioContext;

setInterval(() => {
  const now = audioContext.currentTime;

  const env = audioContext.createGain();
  env.connect(audioContext.destination);
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.1, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1);

  const osc = audioContext.createOscillator();
  osc.frequency.value = 200 + Math.random() * 2800;
  osc.connect(env);
  osc.start(now);
  osc.stop(now + 1);
}, 100);
