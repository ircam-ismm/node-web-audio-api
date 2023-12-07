import { AudioContext, OfflineAudioContext } from '../index.mjs';

const offline = new OfflineAudioContext(1, 44100, 44100);

offline.suspend_and(0.1, function() {
  console.log("hello there", offline.length);
  const osc = offline.createOscillator();
  osc.connect(offline.destination);
  osc.frequency.value = 220;
  osc.start(0);
});

const buffer = await offline.startRendering();
console.log("buffer duration s:", buffer.duration);
const channelData = buffer.getChannelData(0)
console.log("buffer", channelData[40000]);

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const online = new AudioContext({ latencyHint });

const src = online.createBufferSource();
src.loop = true;
src.buffer = buffer;
src.connect(online.destination);
src.start();

await new Promise(resolve => setTimeout(resolve, 3000));

await online.close();
