import path from 'node:path';
import fs from 'node:fs';

import { AudioContext } from '../index.mjs';

const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const context = new AudioContext({ latencyHint });

// Showcase different methods of the AudioBufferSourceNode

const file = fs.readFileSync(path.join('examples', 'samples', 'sample.wav')).buffer;
const audioBuffer = await context.decodeAudioData(file);

{
  console.log("++ play until end");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.start(context.currentTime);
}

await new Promise(resolve => setTimeout(resolve, 3500));

{
  console.log("++ play / stop 1sec");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.start(context.currentTime);
  src.stop(context.currentTime + 1.);
}

await new Promise(resolve => setTimeout(resolve, 1500));

{
  console.log("++ play / stop 1sec with offset");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.start(context.currentTime, 1.);
  src.stop(context.currentTime + 1.);
}

await new Promise(resolve => setTimeout(resolve, 1500));

{
  console.log("++ play 1sec with offset and duration");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.start(context.currentTime, 1., 1.);
}

await new Promise(resolve => setTimeout(resolve, 1500));

{
  console.log("++ play backward from offset 1.");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.playbackRate.value = -1.;
  src.start(context.currentTime, 1.);
}

await new Promise(resolve => setTimeout(resolve, 1500));

{
  console.log("++ play backward full buffer");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.playbackRate.value = -1.;
  src.start(context.currentTime, audioBuffer.duration);
}

await new Promise(resolve => setTimeout(resolve, 3500));

{
  console.log("++ simple loop (x2)");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.loop = true;
  src.start(context.currentTime);
  src.stop(context.currentTime + audioBuffer.duration * 2.);
}

await new Promise(resolve => setTimeout(resolve, 7000));

{
  console.log("++ loop between 1 and 2 starting from 0");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.loop = true;
  src.loopStart = 1.;
  src.loopEnd = 2.;
  src.start(context.currentTime);

  await new Promise(resolve => setTimeout(resolve, 4500));
  src.loop = false;
}

await new Promise(resolve => setTimeout(resolve, 2500));

{
  console.log("++ loop backward between 1 and 2 starting from end");
  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(context.destination);
  src.playbackRate.value = -1.;
  src.loop = true;
  src.loopStart = 1.;
  src.loopEnd = 2.;
  src.start(context.currentTime, audioBuffer.duration);

  await new Promise(resolve => setTimeout(resolve, 4500));
  src.loop = false;
}

await new Promise(resolve => setTimeout(resolve, 2500));

console.log("++ end of examples");

for (let i = 0; i < 9; i++) {
  let offset = i / 2.;

  let gain = i % 4 == 0 ? 1. : 0.2 ;
  let env = context.createGain();
  env.gain.value = gain;
  env.connect(context.destination);

  const src = context.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(env);
  src.start(context.currentTime + offset);
}

await new Promise(resolve => setTimeout(resolve, 8000));

await audioContext.close();
