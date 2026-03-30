// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

// re-export index.cjs to support esm import syntax
// see https://github.com/nodejs/node/issues/40541#issuecomment-951609570

import {
  createRequire,
} from 'module';
const require = createRequire(import.meta.url);

const nativeModule = require('./index.cjs');
// events
// export const OfflineAudioCompletionEvent = nativeModule.OfflineAudioCompletionEvent;
// export const AudioProcessingEvent = nativeModule.AudioProcessingEvent;
// export const AudioRenderCapacityEvent = nativeModule.AudioRenderCapacityEvent;
// manually written nodes
export const BaseAudioContext = nativeModule.BaseAudioContext;
export const AudioContext = nativeModule.AudioContext;
// export const OfflineAudioContext = nativeModule.OfflineAudioContext;

export const AudioNode = nativeModule.AudioNode;
// export const AudioScheduledSourceNode = nativeModule.AudioScheduledSourceNode;
export const AudioParam = nativeModule.AudioParam;
export const AudioDestinationNode = nativeModule.AudioDestinationNode;
// export const AudioListener = nativeModule.AudioListener;
// export const AudioWorklet = nativeModule.AudioWorklet;
// export const AudioParamMap = nativeModule.AudioParamMap;
// export const AudioRenderCapacity = nativeModule.AudioRenderCapacity;

// export const PeriodicWave = nativeModule.PeriodicWave;
// export const AudioBuffer = nativeModule.AudioBuffer;
// generated nodes
export const GainNode = nativeModule.GainNode;
export const OscillatorNode = nativeModule.OscillatorNode;
// helper methods
export const mediaDevices = nativeModule.mediaDevices;

export default nativeModule;
