import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

audioContext.listener.positionZ.value = 1;
audioContext.listener.positionX.value = -10;
audioContext.listener.positionX.linearRampToValueAtTime(10, 4);

const osc = audioContext.createOscillator();
const panner = audioContext.createPanner();
osc.connect(panner);
panner.connect(audioContext.destination);
osc.start();

let direction = 1;
setInterval(function loop() {
    console.log(audioContext.listener.positionX.value);
    if (Math.abs(audioContext.listener.positionX.value) >= 10.) {
        direction *= -1;
        const now = audioContext.currentTime;
        audioContext.listener.positionX.linearRampToValueAtTime(10 * direction, now + 4);
    }
}, 500);
