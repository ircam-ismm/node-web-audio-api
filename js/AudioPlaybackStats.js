const conversions = require('webidl-conversions');

const {
  kNapiObj,
} = require('./lib/symbols.js');
const {
  kEnumerableProperty,
} = require('./lib/utils.js');

class AudioPlaybackStats {
  constructor(options) {
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
      || options[kNapiObj].constructor.name !== 'NapiAudioPlaybackStats'
    ) {
      throw new TypeError('Illegal constructor');
    }

    this[kNapiObj] = options[kNapiObj];
  }

  get underrunDuration() {
    return this[kNapiObj].underrunDuration;
  }

  get underrunEvents() {
    return this[kNapiObj].underrunEvents;
  }

  get totalDuration() {
    return this[kNapiObj].totalDuration;
  }

  get averageLatency() {
    return this[kNapiObj].averageLatency;
  }

  get minimumLatency() {
    return this[kNapiObj].minimumLatency;
  }

  get maximumLatency() {
    return this[kNapiObj].maximumLatency;
  }

  resetLatency() {
    this[kNapiObj].resetLatency();
  }

  toJSON() {
    return JSON.stringify({
      underrunDuration: this.underrunDuration,
      underrunEvents: this.underrunEvents,
      totalDuration: this.totalDuration,
      averageLatency: this.averageLatency,
      minimumLatency: this.minimumLatency,
      maximumLatency: this.maximumLatency,
    });
  }
}

module.exports = AudioPlaybackStats;
