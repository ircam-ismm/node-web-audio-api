import { AudioContext, AudioWorkletNode } from '#node-web-audio-api';
import { delay } from '@ircam/sc-utils';

import '../js/lib/expose-gc.js';

const module = URL.createObjectURL(new Blob([`
  class AudioWorkletDrop extends AudioWorkletProcessor {
    constructor() {
      super();

      this.n = 0;
    }

    process() {
      this.n += 1;

      if (this.n % 10 === 0) {
        try {
          this.port.postMessage({ n: this.n });
        } catch (err) {
          console.log(err);
        }
      }

      return false;
    }
  }

  registerProcessor('drop', AudioWorkletDrop);
`]), { type: 'application/javascript' });

const audioContext = new AudioContext();
await audioContext.audioWorklet.addModule(module);

let node = new AudioWorkletNode(audioContext, 'drop');
node.port.on('message', msg => console.log(msg));
node.connect(audioContext.destination);

await delay(100);

// cf. https://github.com/ircam-ismm/node-web-audio-api/issues/202
// tailTime is false, no input and reference is dropped, the node should be removed from graph
// log should look like:
// > { n: 10 }
// > { n: 20 }
// > { n: 30 }
// > gc call
// [...nothing more...]
console.log('gc call');
node = null;
global.gc();

await delay(3000);
audioContext.close();
