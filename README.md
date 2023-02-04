# Node Web Audio API

[![npm version](https://badge.fury.io/js/node-web-audio-api.svg)](https://badge.fury.io/js/node-web-audio-api)

Node.js bindings for the Rust implementation of the Web Audio API Specification

- see [`orottier/web-audio-api-rs`](https://github.com/orottier/web-audio-api-rs/) for the "real" audio guts
- use [`napi-rs`](https://github.com/napi-rs/napi-rs/) for the Node.js bindigs

The goal of the library is to provide an implementation that is both efficient and _exactly_ matches the browsers' API.

## Install

```
npm install [--save] node-web-audio-api
```

## Example Use

```js
import { AudioContext, OscillatorNode, GainNode } from 'node-web-audio-api';
// or using old fashionned commonjs syntax:
// const { AudioContext, OscillatorNode, GainNode } = require('node-web-audio-api');

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

### Running the Examples

To run all examples locally on your machine you will need to:

1. Install Rust toolchain
```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Clone the repo and build the binary on your machine
```sh
git clone https://github.com/ircam-ismm/node-web-audio-api.git
cd node-web-audio-api
npm install
npm run build
```

3. Run the examples from the project's root directory
```sh
node examples/granular-scrub.mjs
```

## Caveats

- The async methods are not trully async for now and are just patched on the JS side. This will evolve once the "trully" async version of the methods are implemented in the upstream library.
- On Linux systems, the audio backend is currently Alsa, which limits the number of online `AudioContext` to 1. This is subject to change in the future.
- On Raspberry Pi, the default render quantum size (128) is too small and underruns occurs frequently. To prevent that, if you do not explicitely provide a latency hint in the AudioContext options, the value is automatically set to 'playback' which uses a buffer of 1024 samples (~21ms at 48000Hz). While this is not per se spec compliant, it allows usage of the library in a more user friendly manner. In the future, this might change according to the support of other audio backend.
- On Raspberry Pi, the `Linux arm gnueabihf` binary provided only works on 32bit OS. We will provide a version for the 64 bit OS in the future.

## Supported Platforms

|                              | binaries | tested |
| ---------------------------  | ------   | ------ |
| Windows x64                  | ✓        |        |
| Windows arm64                | ✓        |        |
| macOS x64                    | ✓        | ✓      |
| macOS aarch64                | ✓        |        |
| Linux x64 gnu                | ✓        |        |
| Linux arm gnueabihf (RPi)    | ✓        | ✓      |


### Manual Build

If prebuilt binaries are not shippped for your platform, you will need to:

1. Install the Rust toolchain

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install and build from github

```sh
npm install --save git+https://github.com/b-ma/node-web-audio-api.git
cd node_modules/node-web-audio-api
npm run build
```

The package will be built on your machine, which might take some time

## Development notes

The npm `postversion` script rely on [`cargo-bump`](https://crates.io/crates/cargo-bump) to maintain versions synced between the `package.json` and the `Cargo.toml` files. Therefore, you will need to install `cargo-bump` on your machine

```
cargo install cargo-bump
```

## License

[BSD-3-Clause](./LICENSE).
