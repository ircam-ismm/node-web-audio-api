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
}, 50);
```



## Build manually

If prebuilt binaries are not shippped for your platform, you will need to install 
the rust toolchain and install and build the package from github.

1. Install rust toolchain

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install from github

```
npm install --save git+https://github.com/b-ma/node-web-audio-api.git
```

Note that the package will be built on your machine, so the install process might be a bit long

## Roadmap

- Make a few nodes work properly with clean and predictable code
- Generate bindings from IDL [https://webaudio.github.io/web-audio-api/#idl-index](https://webaudio.github.io/web-audio-api/#idl-index)
- Publish on `npm` with binaries
- Implement prototype chain (?)
- Follow developments of `web-audio-api-rs`

## License

This project is licensed under the [BSD-3-Clause license](./LICENSE).
