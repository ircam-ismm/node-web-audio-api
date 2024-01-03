import { OfflineAudioContext } from '../index.mjs';

var off = new OfflineAudioContext(1, 512, 48000);
var osc = new OscillatorNode(off);
var fb = new GainNode(off);
// zero delay feedback loop
osc.connect(fb).connect(fb).connect(off.destination);
osc.start(0);
return off.startRendering().then((b) => {
  return Promise.resolve(b.getChannelData(0));
});
