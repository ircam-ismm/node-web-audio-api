module.exports.kNapiObj = Symbol('node-web-audio-api:napi-obj');
module.exports.kAudioBuffer = Symbol('node-web-audio-api:audio-buffer');

// this needs to be shared with Rust ide
module.exports.kDispatchEvent = Symbol.for('node-web-audio-api:napi-dispatch-event');

// BaseAudioContext
module.exports.kOnStateChange = Symbol.for('node-web-audio-api:onstatechange');
// AudioContext
module.exports.kOnSinkChange = Symbol.for('node-web-audio-api:onsinkchange');
// OfflineAudioContext
// [spec] [onstatechane] This event is fired before the complete event is fired
// https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-onstatechange
module.exports.kOnComplete = Symbol.for('node-web-audio-api:oncomplete');
// AudioScheduledSourceNode
module.exports.kOnEnded = Symbol.for('node-web-audio-api:onended');

