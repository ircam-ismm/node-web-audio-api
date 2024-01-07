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
      this.status = null;
    }

    open(_protocol, url) {
      this._pathname = url;
    }

    send() {
      let buffer;

      try {
        const pathname = path.join(basepath, this._pathname);
        // console.log('[XMLHttpRequest:MOCK]', pathname);
        buffer = fs.readFileSync(pathname).buffer;
      } catch (err) {
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
