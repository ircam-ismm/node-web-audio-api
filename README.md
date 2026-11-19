# Node Web Audio API

[![npm version](https://badge.fury.io/js/node-web-audio-api.svg)](https://badge.fury.io/js/node-web-audio-api)

Node.js bindings for the Rust implementation of the [Web Audio API specification](https://www.w3.org/TR/webaudio/).

The library aims to provide an implementation that is both efficient and compliant with the specification.

- see [`orottier/web-audio-api-rs`](https://github.com/orottier/web-audio-api-rs/) for the "real" audio guts
- use [`napi-rs`](https://github.com/napi-rs/napi-rs/) for the Node.js bindings

## Install

```
npm install [--save] node-web-audio-api
```

## Example Use

```js
import { AudioContext, OscillatorNode, GainNode } from 'node-web-audio-api';
// audioContext is resumed by default
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

For existing browser oriented codebases or libraries that rely on globally available entities
or explicit calls to window (e.g. `window.AudioParam`, cf. `examples/tone.js`) we provide
a polyfill entry point that extends `globalThis` and create a `windows` namespace:

```js
import 'node-web-audio-api/polyfill.js';

console.log(AudioContext);
// [class AudioContext extends BaseAudioContext]
console.log(window.AudioContext);
// [class AudioContext extends BaseAudioContext]
```

## Running the Examples

To run the examples locally on your machine you will need to:

1. Clone the repo
```sh
git clone https://github.com/ircam-ismm/node-web-audio-api.git
```

2. Install dependencies in the examples directory
```sh
npm run examples:install
# Basically a shortcut for `cd examples && npm install`
```

3. Run the examples from the project's root directory
```sh
node examples/granular-scrub.js
```

_Note that in the examples, the library is loaded through a proxy which loads either from the
`examples/node_modules` directory, or from the root of the project if you want to test
against a local build (see [Build](#build)).

In this last case, make sure to run `npm run examples:clean` to delete any previously
installed `examples/node_modules`._

## Caveats

- `AudioBuffer#getChannelData` is implemented but not reliable in some situations. Your should prefer `AudioBuffer#copyToChannel` and `AudioBuffer#copyFromChannel` when you want to access or manipulate the underlying samples in a safe way.
- `Streams`: only a minimal audio input stream and the `MediaStreamSourceNode` are provided. All other `MediaStream` features are left on the side for now as they principally concern a different API specification, which is not a trivial problem.

## Supported Platforms - Prebuilt Binaries

We provide prebuilt binaries for the following platforms:

|                                                     | binaries |
|-----------------------------------------------------|:--------:|
| Windows x64                                         | ✓        |
| Windows arm64                                       | ✓        |
| macOS x64                                           | ✓        |
| macOS aarch64                                       | ✓        |
| Linux x64 gnu (jack / pipewire-jack)                | ✓        |
| Linux arm gnueabihf (jack / pipewire-jack)          | ✓        |
| Linux arm64 gnu     (jack / pipewire-jack)          | ✓        |


If you need support for another platform, please fill an [issue](https://github.com/ircam-ismm/node-web-audio-api/issues) and we will see what we can do.

## Systems without a soundcard

If your system has no soundcard  (e.g CI, Docker image), you can use the `{ sinkId: { type:'none' } }` option when initializing the `AudioContext`:

```js
new AudioContext({ sinkId: { type: 'none' } });
```

Otherwise, your script it will crash with a `DeviceNotAvailable` error

- [see MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#sinkid)


## Notes for Linux users

### Pipewire

The binaries shipped with the package are build to support in order the [pipewire](https://www.pipewire.org/), [Jack](https://jackaudio.org/) and [ALSA](https://www.alsa-project.org/wiki/Main_Page) backends.

This should work on most Linux distribution, which provide `pipewire` as the default backend.

### Audio Backend and Latency

Using the library on Linux with the ALSA backend might lead to unexpected cranky sound with the default render size (i.e. 128 frames). In such cases, a simple workaround is to pass the `playback` latency hint when creating the audio context, which will increase the render size to 1024 frames:

```js
const audioContext = new AudioContext({ latencyHint: 'playback' });
```

For real-time and interactive applications where low latency is crucial, you should instead rely on the JACK backend provided by `cpal`. By default the audio context will use that backend if a running JACK server is found.

If you don't have JACK installed, you can still pass the `WEB_AUDIO_LATENCY=playback` environment variable to all examples to create the audio context with the playback latency hint, e.g.:

```sh
WEB_AUDIO_LATENCY=playback node examples/amplitude-modulation.js
```

## Development Notes

### Diagnostics mode

For debugging purposes, you can build the library with a diagnostic mode that allows you to inspect the
audio graph

```
npm run build:diagnostics
```

This diagnostic mode will expose the non-standard method `runDiagnostics` on the online `AudioContext`

```js
audioContext.runDiagnostics(results => console.log(results));
```

### Local Build

1. Install Rust toolchain

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
````

2. Clone the repo and build the binary on your machine

```sh
git clone https://github.com/ircam-ismm/node-web-audio-api.git
cd node-web-audio-api
npm install
npm run build
```

### Linux Backends

Pre-build binaries are shipped with pipewire, jack and alsa backends supported and tested in this order at runtime.

#### Common dependencies

To build the library, install the ALSA and D-Bus development packages.

```sh
apt install libasound2-dev libdbus-1-dev
npm run build
```

#### Pipewire

```sh
apt-get install libclang-18-dev clang-18 libasound2-dev libdbus-1-dev libpipewire-0.3-dev
npm run build:pipewire
```

Note that you may need to adapt the clang version depending on your OS

### Jack


```sh
apt install libasound2-dev libdbus-1-dev libjack-jackd2-dev
npm run build:jack
```

### Synchronized Versioning

The npm `postversion` script rely on [`cargo-bump`](https://crates.io/crates/cargo-bump) to maintain versions synced between the `package.json` and the `Cargo.toml` files. Therefore, you will need to install `cargo-bump` on your machine

```
cargo install cargo-bump
```

### Running the [WPT](https://github.com/web-platform-tests/wpt/) suite

Follow the steps for [Build](#build) first. Then checkout the web-platform-tests submodule with:

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
