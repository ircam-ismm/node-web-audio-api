import { AudioContext } from '../index.mjs';

const context = new AudioContext();

const analyser = context.createAnalyser();
analyser.connect(context.destination);

const osc = context.createOscillator();
osc.frequency.value = 200.;
osc.connect(analyser);
osc.start();

const bins = new Float32Array(analyser.frequencyBinCount);

setInterval(() => {
    // 10th bind should be highest
    analyser.getFloatFrequencyData(bins);
    console.log(bins.subarray(0, 20)); // print 20 first bins
}, 1000);
