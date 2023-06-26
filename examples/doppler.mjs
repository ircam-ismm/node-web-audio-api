import path from 'node:path';
import fs from 'node:fs';
import { load, AudioContext, PannerNode } from '../index.mjs';

// this example is broken, the mp3 is not decoded properly, for some unknown reason
// this is not the case in the upstream library...

/*
 * This example feature a 'true physics' Doppler effect.
 *
 * The basics are very simple, we just add a DelayNode that represents the finite speed of sound.
 * Speed of sound = 343 m/s
 * So a siren at 100 meters away from you will have a delay of 0.3 seconds. A siren near you
 * obviously has no delay.
 *
 * We combine a delay node with a panner node that represents the moving siren. When the panner
 * node moves closer to the listener, we decrease the delay time linearly. This gives the Doppler
 * effect.
 */
const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

// this soundfile is broken while it is not in
const file = await load(path.join(process.cwd(), 'samples', 'siren.mp3'));
// console.log(file);
// console.log(fs.existsSync(file.path));
// process.exit();
const buffer = await audioContext.decodeAudioData(file);

const pannerOptions = {
  panningModel: 'equalpower',
  distanceModel: 'inverse',
  positionX: 0.,
  positionY: 100., // siren starts 100 meters away
  positionZ: 1.,   // we stand 1 meter away from the road
  orientationX: 1.,
  orientationY: 0.,
  orientationZ: 0.,
  refDistance: 1.,
  maxDistance: 10000.,
  rolloffFactor: 1.,
  // no cone effect:
  coneInnerAngle: 360.,
  coneOuterAngle: 0.,
  coneOuterGain: 0.,
};

const now = audioContext.currentTime;

const panner = new PannerNode(audioContext, pannerOptions);
panner.connect(audioContext.destination);
// // move the siren in 10 seconds from y = 100 to y = -100
panner.positionY.linearRampToValueAtTime(-100., now + 10.);

// // The delay starts with value 0.3, reaches 0 when the siren crosses us, then goes back to 0.3
const delay = audioContext.createDelay(1.);
delay.connect(panner);
const dopplerMax = 100. / 343.;
delay.delayTime.setValueAtTime(dopplerMax, now);
delay.delayTime.linearRampToValueAtTime(0., now + 5.);
delay.delayTime.linearRampToValueAtTime(dopplerMax, now + 10.);


const src = audioContext.createBufferSource();
src.connect(delay);
src.buffer = buffer;
src.loop = true;
src.start(now);

await new Promise(resolve => setTimeout(resolve, 10 * 1000));
