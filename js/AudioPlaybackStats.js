import {
  kNapiObj,
} from './lib/symbols.js';
import {
  kEnumerableProperty,
} from './lib/utils.js';

export class AudioPlaybackStats {
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
    return this[kNapiObj].toJSON();
  }
}

Object.defineProperties(AudioPlaybackStats, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioPlaybackStats.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioPlaybackStats',
  },

  underrunDuration: kEnumerableProperty,
  underrunEvents: kEnumerableProperty,
  totalDuration: kEnumerableProperty,
  averageLatency: kEnumerableProperty,
  minimumLatency: kEnumerableProperty,
  maximumLatency: kEnumerableProperty,
  resetLatency: kEnumerableProperty,
  toJSON: kEnumerableProperty,
});
