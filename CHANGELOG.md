## v0.12.0 (04/09/2023)

- Update upstream crate to v0.33 (fix device number of channels > 32)

## v0.11.0 (21/07/2023)

- Update upstream crate to v0.32
- Implement AudioDestination API
- Make decodeAudioData(arrayBuffer) API compliant (drop `load` helper)

## v0.10.0 (26/05/2023)

- Update upstream crate to v0.31

## v0.9.0 (08/06/2023)

- Update upstream crate to v0.30

## v0.8.0 (19/05/2023)

- Implement MediaDevices enumerateDeviaces and getUserMedia
- Use jack as default output if exists on linux

## v0.7.0 (23/02/2023)

- Improve readme & doc
- Fix AudioParam method names

## v0.6.0 (01/02/2023)

- Basic support for mediaDevices & MediaStreamAudioSourceNode
- Add bindings to ConvolverNode, AnalyserNode & Panner nodes
- Update upstream crate to v0.26

## v0.5.0 (19/12/2022)

- Implement AudioParam#setValueCurveAtTime
- Offline context constructor 

## v0.4.0 (07/11/2022)

- Implement offline audio context
- Update upstream crate to v0.24 
- Implement AudioNode#disconnect
- Properly support ESM
- Limit number of online contexts to 1 on Linux
- Force latencyHint to 'playback' if not manually set on RPi
