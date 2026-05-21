import webaudio from 'node-web-audio-api';

Object.assign(globalThis, webaudio);

// Some libraries explicitly rely on window
if (!globalThis.window) {
  globalThis.window = {};
}

for (let name in webaudio) {
  if (name !== 'mediaDevices') {
    globalThis.window[name] = webaudio[name];
  }
}

globalThis.navigator.mediaDevices = webaudio.mediaDevices;
