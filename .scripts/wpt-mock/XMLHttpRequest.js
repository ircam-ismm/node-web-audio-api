const fs = require('node:fs');
// to be passed to wtp-runner step
// window.XMLHttpRequest = XMLHttpRequest;
class XMLHttpRequest {
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
      buffer = fs.readFileSync(this._pathname).buffer;
    } catch (err) {
      this.onerror(err);
      return;
    }

    this.response = buffer;
    this.onload();
  }
}

module.exports = XMLHttpRequest;
