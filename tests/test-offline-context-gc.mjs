import { OfflineAudioContext } from '../index.mjs';

// Regression test for #133
// <https://github.com/ircam-ismm/node-web-audio-api/issues/133>
//
// uncomment Drop trait in `offline_audio_context.rs` and rebuild
// `node --trace-gc --expose-gc tests/junk-test-offline-context-gc.mjs`
// @todo - add a build flag to automate this

for( let i=0; i < 100000; i++ ) {
  console.log('+ i:', i);

  let offline = new OfflineAudioContext(1, 10*48000, 48000);

  const osc = offline.createOscillator();
  osc.connect(offline.destination);
  osc.frequency.value = 220;
  osc.start(0.);
  osc.stop(10.);

  const buffer = await offline.startRendering();
  console.log('+ buffer duration:', buffer.duration);

  offline = null;

  if (global.gc) {
    global.gc();
  }
}
