# `node-web-audio-api`

> Nodejs bindings for [`orottier/web-audio-api-rs`](https://github.com/orottier/web-audio-api-rs/) using [`napi-rs`](https://github.com/napi-rs/napi-rs/)

## Install

```
npm install [--save] node-web-audio-api
```

## Example

```js
import { AudioContext, OscillatorNode, GainNode } from 'node-web-audio-api';

const audioContext = new AudioContext();

setInterval(() => {
  const now = audioContext.currentTime;

  const env = new GainNode(audioContext);
  env.connect(audioContext.destination);
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(1, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1);

  const osc = new OscillatorNode(audioContext);
  osc.frequency.value = 200 + Math.random() * 2800;
  osc.connect(env);
  osc.start(now);
  osc.stop(now + 1);
}, 80);
```

or using with old fashionned commonjs syntax

```js
const { AudioContext, OscillatorNode, GainNode } = require('node-web-audio-api');

const audioContext = new AudioContext();
//...
```

## Caveats

- Currently the library does not provide any way of chosing the output interface, system default interface will be used. As the spec and web-audio-api evolve evolve, thus should change in the future see [https://github.com/orottier/web-audio-api-rs/issues/216](https://github.com/orottier/web-audio-api-rs/issues/216)
- On Linux systems, the audio backend is Alsa, which limits the number of online
AudioContext to 1. This is subject to change in the future.

### Raspberry Pi

On Raspberry Pi, the default render quantum size (128) is too small and underruns 
occurs frequently. To prevent that, if you do not explicitely provide a latency hint
in the AudioContext options, the value is automatically set to 'playback' which uses
a buffer of 1024 samples. While this is not per se spec compliant, it allow usage
of the library in a more user friendly manner. In the future, this might change according
to the support of other audio backend, which is now alsa.

```js
const audioContext = new AudioContext({ latencyHint: 'playback' });
```

The 'playback' latency hint, 1024 samples / ~21ms at 48000Hz, has been found 
a good value.

## Supported Platforms

|                            | binaries | tested |
| ---------------------------| ------   | ------ |
| Windows x64                | ✓        |        |
| Windows arm64              | ✓        |        |
| macOS x64                  | ✓        | ✓      |
| macOS aarch64              | ✓        |        |
| Linux x64 gnu              | ✓        |        |
| Linux arm gnueabihf (RPi)  | ✓        | ✓      |


### Manual Build

If prebuilt binaries are not shippped for your platform, you will need to:

1. Install rust toolchain

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install and build from github

```sh
npm install --save git+https://github.com/b-ma/node-web-audio-api.git
cd node_modules/node-web-audio-api
npm run build
```

The package will then be built on your machine, which might take some time

## Known limitation / caveats

- async function are not trully async but only monkey patched on the JS side, this will
be updated once `web-audio-api-rs` provide async version of the methods.
- see `web-audio-api-rs`

## Development notes

The npm script rely on [`cargo-bump`](https://crates.io/crates/cargo-bump) to maintain version synced between
the `package.json` and the `Cargo.toml` files. Therefore, you will need to install 
`cargo-bump` on your machine

```
cargo install cargo-bump
```

## License

This project is licensed under the [BSD-3-Clause license](./LICENSE).
