import { AudioContext, OscillatorNode } from '#node-web-audio-api';

import { sleep } from '@ircam/sc-utils';

// ------------------------------------------------------------------
// WARNING
//
// the API in this example is non-standard
// Build library with `npm run build:diagnostics` to have it work
// ------------------------------------------------------------------

const audioContext = new AudioContext();

const src = new OscillatorNode(audioContext, { frequency: 220 });
src.connect(audioContext.destination);
src.start();

const intervalId = setInterval(() => {
  try {
    audioContext.runDiagnostics(e => console.log(e));
  } catch (err) {
    console.log('');
    console.log(err.message);
    console.log('');
    process.exit();
  }
}, 200);

await sleep(6);

clearInterval(intervalId);
src.stop();
audioContext.close();


