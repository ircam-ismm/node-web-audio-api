import { OfflineAudioCompletionEvent as _OfflineAudioCompletionEvent } from './js/Events.js';
import { AudioProcessingEvent as _AudioProcessingEvent } from './js/Events.js';
import { AudioRenderCapacityEvent as _AudioRenderCapacityEvent } from './js/Events.js';
import { ErrorEvent as _ErrorEvent } from './js/Events.js';

import { BaseAudioContext as _BaseAudioContext } from './js/BaseAudioContext.js';
import { AudioContext as _AudioContext } from './js/AudioContext.js';
import { OfflineAudioContext as _OfflineAudioContext } from './js/OfflineAudioContext.js';

import { AudioNode as _AudioNode } from './js/AudioNode.js';
import { AudioScheduledSourceNode as _AudioScheduledSourceNode } from './js/AudioScheduledSourceNode.js';
import { AudioParam as _AudioParam } from './js/AudioParam.js';
import { AudioDestinationNode as _AudioDestinationNode } from './js/AudioDestinationNode.js';
import { AudioListener as _AudioListener } from './js/AudioListener.js';
import { AudioWorklet as _AudioWorklet } from './js/AudioWorklet.js';
import { AudioParamMap as _AudioParamMap } from './js/AudioParamMap.js';
import { AudioRenderCapacity as _AudioRenderCapacity } from './js/AudioRenderCapacity.js';
import { AudioPlaybackStats as _AudioPlaybackStats } from './js/AudioPlaybackStats.js';

import { AudioBuffer as _AudioBuffer } from './js/AudioBuffer.js';
import { PeriodicWave as _PeriodicWave } from './js/PeriodicWave.js';

// audio nodes
${d.nodes.map(n => {
  return `\
import { ${d.name(n)} as _${d.name(n)} } from './js/${d.name(n)}.js';
`
}).join('')}

// promisify MediaDevices API
// @todo - to be handled on Rust side with Task
import nativeBinding from './load-native.cjs';
const _mediaDevices = {};

_mediaDevices.enumerateDevices = async function enumerateDevices() {
  const list = nativeBinding.napiEnumerateDevices();
  return Promise.resolve(list);
};

_mediaDevices.getUserMedia = async function getUserMedia(options) {
  if (options === undefined) {
    throw new TypeError('Failed to execute "getUserMedia" on "MediaDevices": audio must be requested');
  }

  const stream = nativeBinding.napiGetUserMedia(options);
  return Promise.resolve(stream);
};

${d.injectExport(d, '_')}
