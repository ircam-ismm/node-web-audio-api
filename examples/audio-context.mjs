import { AudioContext } from '../index.mjs';
import { delay } from '@ircam/sc-utils';

const audioContext = new AudioContext();

audioContext.addEventListener('statechange', event => {
  // should be called second
  console.log('addEventListener', event);
});

audioContext.onstatechange = event => {
  // should be called first
  console.log('onstatechange', event);
};

await audioContext.suspend();
await delay(1000);
await audioContext.resume();
await delay(1000);
console.log('closing is broken because we have a listener bound to the context')
await audioContext.close();
await delay(1000);



