import { AudioContext } from '../index.mjs';

console.log('AudioContextLatencyCategory::Interactive');

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const sine = audioContext.createOscillator();
sine.frequency.value = 200.;
sine.connect(audioContext.destination);
sine.start();

console.log('- BaseLatency:', audioContext.baseLatency);

(function loop() {
  console.log('-------------------------------------------------');
  console.log('+ currentTime:', audioContext.currentTime);
  console.log('+ OutputLatency:', audioContext.outputLatency);

  setTimeout(loop, 1000);
}());
