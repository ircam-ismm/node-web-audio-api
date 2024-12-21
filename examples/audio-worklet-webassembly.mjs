// https://github.com/GoogleChromeLabs/web-audio-samples/tree/main/src/audio-worklet/design-pattern/wasm
//
// Copyright (c) 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { AudioContext, OscillatorNode, AudioWorkletNode } from '../index.mjs';

const audioContext = new AudioContext();

await audioContext.audioWorklet.addModule('./worklets/wasm-worklet-processor.mjs');
const oscillator = new OscillatorNode(audioContext);
const bypasser = new AudioWorkletNode(audioContext, 'wasm-worklet-processor');
oscillator.connect(bypasser).connect(audioContext.destination);
oscillator.start();

