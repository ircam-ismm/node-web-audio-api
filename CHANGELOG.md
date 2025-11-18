# CHANGELOG

## v1.0.6 - 2025-11-18

- Fix `mjs` exports

## v1.0.4 - 2025-03-20

- Fix parsing of parameterData for AudioWorkletNode

## v1.0.3 - 2025-03-06

- Improve typescript support

## v1.0.2 - 2025-03-01

- Fix error handling when setting buffer in ABSN and Convolver

## v1.0.1 - 2025-01-17

- Update upstream crate to [v1.2.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-120-2025-01-16)

## v1.0.0 - 2025-01-11

- Align version with upstream crate
- Refactor CI

## v0.21.5 - 2024-12-23

- Fix: Use module import for `AudioWorklet#addModule`
- Feat: Resolve `AudioWorkletNode` when installed in `node_modules`
- Ensure support of `AudioWorkletNode` that use Web Assembly

## v0.21.4 - 2024-12-16

- Update upstream crate to [v1.1.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-110-2024-12-11)

## v0.21.3 - 2024-10-06

- Fix typescript export

## v0.21.2 - 2024-09-20

- Update upstream crate to [v1.0.1](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-101-2024-09-18)
- Fix: Make sure `AudioBuffer` returned by `OfflineContext` is valid
- Fix: Allow contexts to be properly garbage collected

## v0.21.1 - 2024-06-10

- Feat: Buffer pool for AudioWorketProcessor
- Fix: Propagate `addModule` errors to main thread
- Fix: Memory leak due to `onended` events

## v0.21.0 - 2024-05-17

- Feat: Implement AudioWorkletNode

## v0.20.0 - 2024-04-29

- Update upstream crate to [v0.44.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0440-2024-04-22)
- Implement ScriptProcessorNode
- Fix memory leak introduced in v0.19.0
- Improve events compliance

## v0.19.0 - 2024-04-17

- Update upstream crate to [1.0.0-rc.5](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0430--100-rc5-2024-04-15)
- Provide JS facades with proper inheritance chain for all exposed interfaces
- Implement all AudioNode connect / disconnect alternatives
- Improve compliance and error handling

## v0.18.0 - 2024-03-13

- Fix `MediaStreamAudioSourceNode`

## v0.17.0 - 2024-03-08

- Update upstream crate to [1.0.0-rc.2](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-100-rc2-2024-03-07)
- Improve compliance and error handling

## v0.16.0 - 2024-02-09

- Update upstream create to [v0.42.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0420-2024-02-05)
- Improve Error handling
- Add channelCount to media constraints

## v0.15.0 - 2024-01-16

- Update upstream create to [v0.41.1](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0411-2024-01-11)
- Better error handling
- Implement online AudioContext and AudioScheduledSourceNode events
- Test against wpt

## v0.14.0 - 2023-12-06

- Update upstream create to [v0.38.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0380-2023-12-03)
- Implement AudioListener

## v0.13.0 - 2023-11-08

- Update upstream crate to [v0.36.1](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0361-2023-11-08)
- Ship build for linux arm64
- Typescript support

## v0.12.0 - 2023-09-04

- Update upstream crate to [v0.33](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0330-2023-07-27)

## v0.11.0 - 2023-07-21

- Update upstream crate to [v0.32](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0320-2023-07-16)
- Implement AudioDestination API
- Make decodeAudioData(arrayBuffer) API compliant (drop `load` helper)

## v0.10.0 - 2023-05-26

- Update upstream crate to [v0.31](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0310-2023-06-25)

## v0.9.0 - 2023-06-08

- Update upstream crate to [v0.30](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0300-2023-06-07)

## v0.8.0 - 2023-05-19

- Implement MediaDevices enumerateDevices and getUserMedia
- Use jack as default output if exists on linux

## v0.7.0 - 2023-02-23

- Improve readme & doc
- Fix AudioParam method names

## v0.6.0 - 2023-02-01

- Basic support for mediaDevices & MediaStreamAudioSourceNode
- Add bindings to ConvolverNode, AnalyserNode & Panner nodes
- Update upstream crate to [v0.26](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0250-2022-11-06)

## v0.5.0 - 2022-12-19

- Implement AudioParam#setValueCurveAtTime
- Offline context constructor

## v0.4.0 - 2022-11-07

- Implement offline audio context
- Update upstream crate to [v0.24](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0240-2022-09-10)
- Implement AudioNode#disconnect
- Properly support ESM
- Limit number of online contexts to 1 on Linux
- Force latencyHint to 'playback' if not manually set on RPi
