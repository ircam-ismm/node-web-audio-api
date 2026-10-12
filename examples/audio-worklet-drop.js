import { AudioContext, AudioWorkletNode, GainNode } from '#node-web-audio-api';

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

// const gain = new GainNode(audioContext, {});
// gain.connect(node);

await new Promise(r => setTimeout(r, 100));

node.disconnect();
node = null;

console.log('gc call');
global.gc();
setInterval(() => {
  console.log('gc call');
  global.gc();
}, 1000);
