# Node Web Audio API

[![npm version](https://badge.fury.io/js/node-web-audio-api.svg)](https://badge.fury.io/js/node-web-audio-api)

Node.js bindings for the Rust implementation of the [Web Audio API](https://www.w3.org/TR/webaudio/).

This library aims to provide an implementation that is both efficient and compliant with the specification.

- see [`orottier/web-audio-api-rs`](https://github.com/orottier/web-audio-api-rs/) for the "real" audio guts
- use [`napi-rs`](https://github.com/napi-rs/napi-rs/) for the Node.js bindings

## Install

```
npm install [--save] node-web-audio-api
```

## Example Use

```js
import { AudioContext, OscillatorNode, GainNode } from 'node-web-audio-api';
// or using old fashioned commonjs syntax:
// const { AudioContext, OscillatorNode, GainNode } = require('node-web-audio-api');
const audioContext = new AudioContext();

setInterval(() => {
  const now = audioContext.currentTime;
  const frequency = 200 + Math.random() * 2800;

  const env = new GainNode(audioContext, { gain: 0 });
  env.connect(audioContext.destination);
  env.gain
    .setValueAtTime(0, now)
    .linearRampToValueAtTime(0.2, now + 0.02)
    .exponentialRampToValueAtTime(0.0001, now + 1);

  const osc = new OscillatorNode(audioContext, { frequency });
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

- Missing nodes: `ScriptProcessorNode`, `AudioWorkletNode`.
- Streams: only a minimial audio input stream and the `MediaStreamSourceNode` are provided. All other `MediaStream` features are left on the side for now as they principaly concern a different API specification, which is not a trivial problem.
- Some async methods (e.g. `decodeAudioData`, `setSinkId`) are not trully async yet. This will evolve with the implemetation of the async version in the upstream crate.

## Supported Platforms

|                              | binaries | tested |
| ---------------------------  | ------   | ------ |
| Windows x64                  | ✓        |        |
| Windows arm64                | ✓        |        |
| macOS x64                    | ✓        | ✓      |
| macOS aarch64                | ✓        | ✓      |
| Linux x64 gnu                | ✓        |        |
| Linux arm gnueabihf (RPi)    | ✓        | ✓      |
| Linux arm64 gnu (RPi)        | ✓        | ✓      |


## Notes for Linux users

Using the library on Linux with the ALSA backend might lead to unexpected cranky sound with the default render size (i.e. 128 frames). In such cases, a simple workaround is to pass the `playback` latency hint when creating the audio context, which will increase the render size to 1024 frames:

```js
const audioContext = new AudioContext({ latencyHint: 'playback' });
```

For real-time and interactive applications where low latency is crucial, you should instead rely on the JACK backend provided by `cpal`. By default the audio context will use that backend if a running JACK server is found.

If you don't have JACK installed, you can still pass the `WEB_AUDIO_LATENCY=playback` env variable to all examples to create the audio context with the playback latency hint, e.g.:

```sh
WEB_AUDIO_LATENCY=playback node examples/amplitude-modulation.mjs
```

### Manual Build

If prebuilt binaries are not shippped for your platform, you will need to:

1. Install the Rust toolchain

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install and build from github

```sh
git clone https://github.com/ircam-ismm/node-web-audio-api.git node_modules/node-web-audio-api
cd node_modules/node-web-audio-api
npm install
npm run build
```

The package will be built on your machine, which might take some time.

Be aware that the package won't be listed on your `package.json` file, and that it won't be re-installed if running `npm install` again. A possible workaround would be to include the above in a postinstall script.

## Development notes

The npm `postversion` script rely on [`cargo-bump`](https://crates.io/crates/cargo-bump) to maintain versions synced between the `package.json` and the `Cargo.toml` files. Therefore, you will need to install `cargo-bump` on your machine

```
cargo install cargo-bump
```

## Running the web-platform-test suite

Follow the steps for 'Manual Build' first. Then checkout the web-platform-tests submodule with:

```
git submodule init
git submodule update
```

Then run:

```
npm run wpt                      # build in debug mode and run all wpt test
npm run wpt:only                 # run all wpt test without build
npm run wpt -- --list            # list all wpt test files
npm run wpt -- --filter <string> # apply <string> filter on executed/listed wpt tests 
```

## License

[BSD-3-Clause](./LICENSE)
