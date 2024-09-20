# CHANGELOG

## v0.21.2 (20/09/2024)

- - Update upstream crate to [v1.0.1](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-101-2024-09-18)
- Fix: Make sure `AudioBuffer` returned by `OfflineContext` is valid
- Fix: Allow contexts to be properly garbage collected

## v0.21.1 (10/06/2024)

- Feat: Buffer pool for AudioWorketProcessor
- Fix: Propagate `addModule` errors to main thread
- Fix: Memory leak due to `onended` events

## v0.21.0 (17/05/2024)

- Feat: Implement AudioWorkletNode

## v0.20.0 (29/04/2024)

- Update upstream crate to [v0.44.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0440-2024-04-22)
- Implement ScriptProcessorNode
- Fix memory leak introduced in v0.19.0
- Improve events compliance

## v0.19.0 (17/04/2024)

- Update upstream crate to [1.0.0-rc.5](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0430--100-rc5-2024-04-15)
- Provide JS facades with proper inheritance chain for all exposed interfaces
- Implement all AudioNode connect / disconnect alternatives
- Improve compliance and error handling

## v0.18.0 (13/03/2024)

- Fix `MediaStreamAudioSourceNode`

## v0.17.0 (08/03/2024)

- Update upstream crate to [1.0.0-rc.2](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-100-rc2-2024-03-07)
- Improve compliance and error handling

## v0.16.0 (09/02/2024)

- Update upstream create to [v0.42.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0420-2024-02-05)
- Improve Error handling
- Add channelCounnt to media constraints

## v0.15.0 (16/01/2024)

- Update upstream create to [v0.41.1](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0411-2024-01-11)
- Better error handling
- Implement online AudioContext and AudioScheduledSourceNode events
- Test against wpt

## v0.14.0 (06/12/2023)

- Update upstream create to [v0.38.0](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0380-2023-12-03)
- Implement AudioListener

## v0.13.0 (08/11/2023)

- Update upstream crate to [v0.36.1](https://github.com/orottier/web-audio-api-rs/blob/main/CHANGELOG.md#version-0361-2023-11-08)
- Ship build for linux arm64
- Typescript support

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
