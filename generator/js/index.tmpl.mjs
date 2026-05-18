// re-export index.cjs to support esm import syntax
// see https://github.com/nodejs/node/issues/40541#issuecomment-951609570

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const cjsModule = require('./index.cjs');
// events
export const OfflineAudioCompletionEvent = cjsModule.OfflineAudioCompletionEvent;
export const AudioProcessingEvent = cjsModule.AudioProcessingEvent;
export const AudioRenderCapacityEvent = cjsModule.AudioRenderCapacityEvent;
export const ErrorEvent = cjsModule.ErrorEvent;
// manually written nodes
export const BaseAudioContext = cjsModule.BaseAudioContext;
export const AudioContext = cjsModule.AudioContext;
export const OfflineAudioContext = cjsModule.OfflineAudioContext;

export const AudioNode = cjsModule.AudioNode;
export const AudioScheduledSourceNode = cjsModule.AudioScheduledSourceNode;
export const AudioParam = cjsModule.AudioParam;
export const AudioDestinationNode = cjsModule.AudioDestinationNode;
export const AudioListener = cjsModule.AudioListener;
export const AudioWorklet = cjsModule.AudioWorklet;
export const AudioParamMap = cjsModule.AudioParamMap;
export const AudioRenderCapacity = cjsModule.AudioRenderCapacity;
export const AudioPlaybackStats = cjsModule.AudioPlaybackStats;

export const PeriodicWave = cjsModule.PeriodicWave;
export const AudioBuffer = cjsModule.AudioBuffer;

// generated nodes
${d.nodes.map(n => `export const ${d.name(n)} = cjsModule.${d.name(n)};`).join('\n')}
// helper methods
export const mediaDevices = cjsModule.mediaDevices;

export default cjsModule;

