import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const analyser = audioContext.createAnalyser();
analyser.connect(audioContext.destination);

const osc = audioContext.createOscillator();
osc.frequency.value = 200.;
osc.connect(analyser);
osc.start();

const bins = new Float32Array(analyser.frequencyBinCount);

setInterval(() => {
    // 10th bind should be highest
    analyser.getFloatFrequencyData(bins);
    console.log(bins.subarray(0, 20)); // print 20 first bins
}, 1000);
