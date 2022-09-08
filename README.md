# `node-web-audio-api`

> Nodejs bindings for [`orottier/web-audio-api-rs`](https://github.com/orottier/web-audio-api-rs/) using [`napi-rs`](https://github.com/napi-rs/napi-rs/)

## Install

```
npm install [--save] node-web-audio-api
```

## Example

```js
const { AudioContext, OscillatorNode, GainNode } = require('node-web-audio-api');

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
}, 50);
```

or using with EcmaScript module syntax

```js
import wabaudioapi from 'node-web-audio-api';
const { AudioContext, OscillatorNode, GainNode } = webaudioapi;

const audioContext = new AudioContext();

//...
```

## Supported Platforms

|                       | binaries | tested |
| --------------------- | ------   | ------ |
| Windows x64           | ✓        |        |
| Windows arm64         | ✓        |        |
| macOS x64             | ✓        | ✓      |
| macOS aarch64         | ✓        |        |
| Linux x64 gnu         | ✓        |        |
| Linux arm gnueabihf   | ✓        | ✓      |


### Build manually

If prebuilt binaries are not shippped for your platform, you will need to:

1. Install rust toolchain

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install and build from github

```
npm install --save git+https://github.com/b-ma/node-web-audio-api.git
cd node_modules/node-web-audio-api
npm run build
```

The package will then be built on your machine, which might take some time


## License

This project is licensed under the [BSD-3-Clause license](./LICENSE).
