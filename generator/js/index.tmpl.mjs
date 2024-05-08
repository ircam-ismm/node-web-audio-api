// re-export index.cjs to support esm import syntax
// see https://github.com/nodejs/node/issues/40541#issuecomment-951609570

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nativeModule = require('./index.cjs');
export const {
  // events
  OfflineAudioCompletionEvent,
  AudioProcessingEvent,
  AudioRenderCapacityEvent,

  // manually written nodes
  BaseAudioContext,
  AudioContext,
  OfflineAudioContext,

  AudioNode,
  AudioScheduledSourceNode,
  AudioParam,
  AudioDestinationNode,
  AudioListener,
  AudioRenderCapacity,

  PeriodicWave,
  AudioBuffer,
  // generated nodes
${d.nodes.map(n => `  ${d.name(n)},`).join('\n')}

  // helper methods
  mediaDevices,
} = nativeModule;

export default nativeModule;

