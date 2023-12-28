const fs = require('node:fs');
const path = require('node:path');

// to be passed to wtp-runner step
// window.XMLHttpRequest = XMLHttpRequest;
module.exports = function createXMLHttpRequest(basepath) {
  return class XMLHttpRequest {
    constructor() {
      this._pathname;
      this.onload;
      this.onerror;
      this.response;
    }

    open(_protocol, url) {
      this._pathname = url;
    }

    send() {
      let buffer;

      try {
        const pathname = path.join(basepath, this._pathname);
        buffer = fs.readFileSync(pathname).buffer;
      } catch (err) {
        this.onerror(err);
        return;
      }

      this.response = buffer;
      this.onload();
    }
  }
}
