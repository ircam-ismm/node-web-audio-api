const fs = require('node:fs');
// to be passed to wtp-runner step
// window.XMLHttpRequest = XMLHttpRequest;
class XMLHttpRequest {
  constructor() {
    this._pathname;
    this._onload;
    this._onerror;
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
      this._onerror(err);
      return;
    }

    this.response = buffer;
    this._onload();
  }

  set onload(func) {
    this._onload = func;
  }

  set onerror(func) {
    this._onerror = func;
  }
}

module.exports = XMLHttpRequest;
