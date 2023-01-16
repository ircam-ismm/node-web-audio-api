// re-export index.js to support clean esm syntax
// see https://github.com/nodejs/node/issues/40541#issuecomment-951609570

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nativeModule = require('./index.cjs');
export const {
  AudioContext,
  OfflineAudioContext,
  AudioBuffer,
  PeriodicWave,
  // manually written nodes
  MediaStreamAudioSourceNode,
  // generated supported nodes
${d.supportedNodes.map(n => `  ${n},`).join('\n')}

  // helper methods
  load,
  mediaDevices,
} = nativeModule;

export default nativeModule;
