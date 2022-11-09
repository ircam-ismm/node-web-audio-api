// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

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
  // generated supported nodes
  AudioBufferSourceNode,
  BiquadFilterNode,
  ChannelMergerNode,
  ChannelSplitterNode,
  ConstantSourceNode,
  DelayNode,
  DynamicsCompressorNode,
  GainNode,
  IIRFilterNode,
  OscillatorNode,
  StereoPannerNode,
  WaveShaperNode,
  // helper methods
  load,
} = nativeModule;

export default nativeModule;

  
