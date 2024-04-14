const fs = require('node:fs');
const path = require('node:path');

// @note - once all of them are listed, make a pull request to wpt to harmonize all file loading calls
const relativePathPatches = {
  'resources/audiobuffersource-multi-channels-expected.wav': 'the-audio-api/the-audiobuffersourcenode-interface/resources/audiobuffersource-multi-channels-expected.wav',
};

// to be passed to wtp-runner step
// window.XMLHttpRequest = XMLHttpRequest;
module.exports = function createXMLHttpRequest(basepath) {
  return class XMLHttpRequest {
    constructor() {
      this._pathname;
      this.onload;
      this.onerror;
      this.response;
      this.status = null;
    }

    open(_protocol, url) {
      // apply patch when url are given as relative
      if (url in relativePathPatches) {
        url = relativePathPatches[url];
      }

      this._pathname = url;
    }

    send() {
      const pathname = path.join(basepath, this._pathname);
      let buffer;

      try {
        buffer = fs.readFileSync(pathname).buffer;
      } catch (err) {
        console.log('[XMLHttpRequest mock] could not find file:', pathname);
        this.status = 404;
        this.onerror(err);
        return;
      }

      this.status = 200;
      this.response = buffer;
      this.onload();
    }
  }
}
