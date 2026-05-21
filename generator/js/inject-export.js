export function injectExport(d, prefix) {
  return `
export const OfflineAudioCompletionEvent = ${prefix}OfflineAudioCompletionEvent;
export const AudioProcessingEvent = ${prefix}AudioProcessingEvent;
export const AudioRenderCapacityEvent = ${prefix}AudioRenderCapacityEvent;
export const ErrorEvent = ${prefix}ErrorEvent;

export const BaseAudioContext = ${prefix}BaseAudioContext;
export const AudioContext = ${prefix}AudioContext;
export const OfflineAudioContext = ${prefix}OfflineAudioContext;

export const AudioBuffer = ${prefix}AudioBuffer;
export const PeriodicWave = ${prefix}PeriodicWave;
export const AudioListener = ${prefix}AudioListener;
export const AudioDestinationNode = ${prefix}AudioDestinationNode;
export const AudioParamMap = ${prefix}AudioParamMap;
export const AudioPlaybackStats = ${prefix}AudioPlaybackStats;
export const AudioRenderCapacity = ${prefix}AudioRenderCapacity;
export const AudioScheduledSourceNode = ${prefix}AudioScheduledSourceNode;
export const AudioWorklet = ${prefix}AudioWorklet;
// generated entities
export const AudioParam = ${prefix}AudioParam;
export const AudioNode = ${prefix}AudioNode;
// all audio nodes
${d.nodes.map(n => {
  return `\
export const ${d.name(n)} = ${prefix}${d.name(n)};
`
}).join('')}

export const mediaDevices = ${prefix}mediaDevices;

export default {
  OfflineAudioCompletionEvent: ${prefix}OfflineAudioCompletionEvent,
  AudioProcessingEvent: ${prefix}AudioProcessingEvent,
  AudioRenderCapacityEvent: ${prefix}AudioRenderCapacityEvent,
  ErrorEvent: ${prefix}ErrorEvent,
  AudioBuffer: ${prefix}AudioBuffer,
  PeriodicWave: ${prefix}PeriodicWave,
  AudioListener: ${prefix}AudioListener,
  AudioDestinationNode: ${prefix}AudioDestinationNode,
  AudioParamMap: ${prefix}AudioParamMap,
  AudioPlaybackStats: ${prefix}AudioPlaybackStats,
  AudioRenderCapacity: ${prefix}AudioRenderCapacity,
  AudioScheduledSourceNode: ${prefix}AudioScheduledSourceNode,
  AudioWorklet: ${prefix}AudioWorklet,
  BaseAudioContext: ${prefix}BaseAudioContext,
  AudioContext: ${prefix}AudioContext,
  OfflineAudioContext: ${prefix}OfflineAudioContext,
  // generated
  AudioParam: ${prefix}AudioParam,
  AudioNode: ${prefix}AudioNode,
  ${d.nodes.map(n => {
  return `\
  ${d.name(n)}: ${prefix}${d.name(n)},
`
  }).join('')}

  mediaDevices: ${prefix}mediaDevices,
};
  `;
}
