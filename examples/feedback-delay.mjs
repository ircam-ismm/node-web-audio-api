import { AudioContext } from '../index.mjs';

function triggerSine(audioContext, delayInput) {
  const now = audioContext.currentTime;
  const baseFreq = 100.;
  const numPartial = 1 + Math.floor(Math.random() * 20);

  const env = audioContext.createGain();
  env.connect(delayInput);
  env.gain.setValueAtTime(0., now);
  env.gain.linearRampToValueAtTime(1. / numPartial, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1.);

  const osc = audioContext.createOscillator();
  osc.connect(env);
  osc.frequency.value = baseFreq * numPartial;
  osc.start(now);
  osc.stop(now + 1.);
}


const audioContext = new AudioContext();

// create feedback delay graph layout
//                           |<- feedback <-|
//            |-> pre-gain -----> delay ------>|
// src ---> input ----------------------------------> output

const output = audioContext.createGain();
output.connect(audioContext.destination);

const delay = audioContext.createDelay(1.);
delay.delayTime.value = 0.3;
delay.connect(output);

const feedback = audioContext.createGain();
feedback.gain.value = 0.85;
feedback.connect(delay);
delay.connect(feedback);

const preGain = audioContext.createGain();
preGain.gain.value = 0.5;
preGain.connect(feedback);

const input = audioContext.createGain();
input.connect(preGain);
input.connect(audioContext.destination); // direct sound

(function loop() {
  triggerSine(audioContext, input);

  const period = Math.floor(Math.random() * 930) + 170;
  setTimeout(loop, period);
}());

