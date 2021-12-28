# `node-web-audio-api-rs`

> Nodejs bindings for [`orottier/web-audio-api-rs`](https://github.com/orottier/web-audio-api-rs/) using [`napi-rs`](https://github.com/napi-rs/napi-rs/)

## Install (@todo)

```
npm install node-web-audio-api-rs
```

## Example

```js
const { AudioContext, OscillatorNode, GainNode } = require('node-web-audio-api-rs');

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

```sh
node simple-test.js
```

## Roadmap

- Make something simple work well with clean code
- Generate bindings from IDL [https://webaudio.github.io/web-audio-api/#idl-index](https://webaudio.github.io/web-audio-api/#idl-index)
- Follow developments of `web-audio-api-rs`
- See how the prototype chain could be implemented

## License

MIT
