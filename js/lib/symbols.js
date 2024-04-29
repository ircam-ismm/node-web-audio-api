module.exports.kNapiObj = Symbol('node-web-audio-api:napi-obj');
module.exports.kAudioBuffer = Symbol('node-web-audio-api:audio-buffer');


// semi-private keys for events listeners

// # BaseAudioContext
module.exports.kOnStateChange = Symbol.for('node-web-audio-api:onstatechange');
// AudioContext
module.exports.kOnSinkChange = Symbol.for('node-web-audio-api:onsinkchange');
// # OfflineAudioContext
// > [The onstatechange] event is fired before the complete event is fired
// cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-onstatechange
// @fixme: for now the `complete` event is triggered **before** startRenring fulfills
module.exports.kOnComplete = Symbol.for('node-web-audio-api:oncomplete');
// # AudioScheduledSourceNode
module.exports.kOnEnded = Symbol.for('node-web-audio-api:onended');
// # ScriptProcessorNode
module.exports.kOnAudioProcess = Symbol.for('node-web-audio-api:onaudioprocess');
// # AudioRenderCapacity
module.exports.kOnUpdate = Symbol.for('node-web-audio-api:onupdate');

