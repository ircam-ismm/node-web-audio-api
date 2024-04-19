module.exports.kNapiObj = Symbol('node-web-audio-api:napi-obj');
module.exports.kAudioBuffer = Symbol('node-web-audio-api:audio-buffer');

// this needs to be shared with Rust ide
module.exports.kDispatchEvent = Symbol.for('node-web-audio-api:napi-dispatch-event');

module.exports.kOnStateChange = Symbol.for('node-web-audio-api:onstatechange');
module.exports.kOnSinkChange = Symbol.for('node-web-audio-api:onsinkchange');
module.exports.kOnComplete = Symbol.for('node-web-audio-api:oncomplete');
module.exports.kOnEnded = Symbol.for('node-web-audio-api:onended');

