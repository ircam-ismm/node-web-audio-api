const { AudioContext, OscillatorNode, GainNode } = require('./index');

// console.assert(sync(0) === 100, 'Simple test failed')
// console.info('Simple test passed')

const audioContext = new AudioContext();

setInterval(() => {
  // console.log(audioContext.currentTime, audioContext.sampleRate);
  const now = audioContext.currentTime;

  const env = new GainNode(audioContext);
  env.connect(audioContext.destination);
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(1, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1);

  const osc = new OscillatorNode(audioContext);
  osc.frequency.value = 200 + Math.random() * 2800;
  osc.connect(env);
  osc.start(now);
  osc.stop(now + 1);
}, 50);
