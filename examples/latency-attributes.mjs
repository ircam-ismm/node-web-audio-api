import webaudioapi from '../index.js';
const { AudioContext } = webaudioapi;

console.log("AudioContextLatencyCategory::Interactive");

const context = new AudioContext();
// const context = new AudioConntext({ latencyHint: 'playback' });

const sine = context.createOscillator();
sine.frequency.value = 200.;
sine.connect(context.destination);
sine.start();

console.log("- BaseLatency: {:?}", context.baseLatency);

(function loop() {
  console.log("-------------------------------------------------");
  console.log("+ currentTime {:?}", context.currentTime);
  console.log("+ OutputLatency: {:?}", context.outputLatency);

  setTimeout(loop, 1000);
}());
