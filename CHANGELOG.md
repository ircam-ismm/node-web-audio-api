## v0.13.0 (08/11/2023)

- Update upstream crate to [v0.36.1](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0361-2023-11-08)
- Ship build for linux arm64

## v0.12.0 (04/09/2023)

- Update upstream crate to [v0.33](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0330-2023-07-27)

## v0.11.0 (21/07/2023)

- Update upstream crate to [v0.32](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0320-2023-07-16)
- Implement AudioDestination API
- Make decodeAudioData(arrayBuffer) API compliant (drop `load` helper)

## v0.10.0 (26/05/2023)

- Update upstream crate to [v0.31](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0310-2023-06-25)

## v0.9.0 (08/06/2023)

- Update upstream crate to [v0.30](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0300-2023-06-07)

## v0.8.0 (19/05/2023)

- Implement MediaDevices enumerateDeviaces and getUserMedia
- Use jack as default output if exists on linux

## v0.7.0 (23/02/2023)

- Improve readme & doc
- Fix AudioParam method names

## v0.6.0 (01/02/2023)

- Basic support for mediaDevices & MediaStreamAudioSourceNode
- Add bindings to ConvolverNode, AnalyserNode & Panner nodes
- Update upstream crate to [v0.26](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0250-2022-11-06)

## v0.5.0 (19/12/2022)

- Implement AudioParam#setValueCurveAtTime
- Offline context constructor 

## v0.4.0 (07/11/2022)

- Implement offline audio context
- Update upstream crate to [v0.24](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0240-2022-09-10)
- Implement AudioNode#disconnect
- Properly support ESM
- Limit number of online contexts to 1 on Linux
- Force latencyHint to 'playback' if not manually set on RPi
