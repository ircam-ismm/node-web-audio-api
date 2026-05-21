
// Promisify NapiMediaDevices API
// @todo - https://github.com/ircam-ismm/node-web-audio-api/issues/178
import nativeBinding from '../load-native.js';

export const mediaDevices = {
  async enumerateDevices() {
    const list = nativeBinding.napiEnumerateDevices();
    return Promise.resolve(list);
  },

  async getUserMedia(options) {
    if (options === undefined) {
      throw new TypeError('Failed to execute "getUserMedia" on "MediaDevices": audio must be requested');
    }

    const stream = nativeBinding.napiGetUserMedia(options);
    return Promise.resolve(stream);
  },
};
