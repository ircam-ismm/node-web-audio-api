
// Promisify NapiMediaDevices API
// @todo - https://github.com/ircam-ismm/node-web-audio-api/issues/178
import nativeBinding from '../load-native.js';
import {
  throwSanitizedError,
} from './lib/errors.js';

export const mediaDevices = {
  async enumerateDevices() {
    const list = nativeBinding.napiEnumerateDevices();
    return Promise.resolve(list);
  },

  async getUserMedia(options) {
    let stream;

    // properly handle errors fro Rust
    try {
      stream = nativeBinding.napiGetUserMedia(options);
    } catch (err) {
      throwSanitizedError(err);
    }

    return Promise.resolve(stream);
  },
};
