const path = require('node:path');

const XMLHttpRequest = require('./XMLHttpRequest.js');
const { OfflineAudioContext } = require('../../index.cjs');

// maybe should be passed to wtp-runner setup too
// window.alert = console.log.bind(console);
const alert = console.log.bind(console);

// this is the BufferLoader from the wpt suite
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    loader.context.decodeAudioData(request.response, decodeSuccessCallback, decodeErrorCallback);
  };

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  };

  var decodeSuccessCallback = function(buffer) {
    loader.bufferList[index] = buffer;
    if (++loader.loadCount == loader.urlList.length)
      loader.onload(loader.bufferList);
  };

  var decodeErrorCallback = function() {
    alert('decodeErrorCallback: decode error');
  };

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}

// ----------------------------------------------
// testing
// ----------------------------------------------

const offlineContext = new OfflineAudioContext({
  numberOfChannels: 1,
  length: 1,
  sampleRate: 48000,
});

const okFile = [path.join('examples', 'samples', 'sample.wav')];
const err1File = [path.join('examples', 'samples', 'corrupt.wav')];
const err2File = [path.join('examples', 'samples', 'donotexists.wav')];

{
  // should work
  const loader = new BufferLoader(offlineContext, okFile, audioBuffer => console.log(audioBuffer));
  loader.load();
}

{
  // should fail - decode error
  const loader = new BufferLoader(offlineContext, err1File, audioBuffer => console.log(audioBuffer));
  loader.load();
}

{
  // should fail - file not found
  const loader = new BufferLoader(offlineContext, err2File, audioBuffer => console.log(audioBuffer));
  loader.load();
}
