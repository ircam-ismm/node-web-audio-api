## v0.11.0

- Update upstream crate to v0.32
- Implement AudioDestination API
- Make decodeAudioData(arrayBuffer) API compliant (drop `load` helper)

## v0.10.0

- Update upstream crate to v0.31

## v0.9.0

- Update upstream crate to v0.30

## v0.8.0

- Implement MediaDevices enumerateDeviaces and getUserMedia
- Use jack as default output if exists on linux

## v0.7.0

- Improve readme & doc
- Fix AudioParam method names

## v0.6.0 - Feb 2023

- Basic support for mediaDevices & MediaStreamAudioSourceNode
- Add bindings to ConvolverNode, AnalyserNode & Panner nodes
- Update upstream crate to v0.26

## v0.5.0 - Dec 2022

- Implement AudioParam#setValueCurveAtTime
- Offline context constructor 

## v0.4.0 - Nov 2022

- Implement offline audio context
- Update upstream crate to v0.24 
- Implement AudioNode#disconnect
- Properly support ESM
- Limit number of online contexts to 1 on Linux
- Force latencyHint to 'playback' if not manually set on RPi
