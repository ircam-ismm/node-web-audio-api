import { AudioContext, OscillatorNode, GainNode } from 'node-web-audio-api';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

setInterval(() => {
  const now = audioContext.currentTime;

  const env = new GainNode(audioContext);
  env.connect(audioContext.destination);
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.2, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1);

  const osc = new OscillatorNode(audioContext);
  osc.frequency.value = 200 + Math.random() * 2800;
  osc.connect(env);
  osc.start(now);
  osc.stop(now + 1);
}, 80);

