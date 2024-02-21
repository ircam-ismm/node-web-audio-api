// @note - This should be reviewed (but how...?)
//
// We can't really use the AudioNode mixin because we need to wrap
// the native destination instance.

const { throwSanitizedError } = require('./lib/errors.js');
const { AudioParam, kNativeAudioParam } = require('./AudioParam.js');
const kNativeAudioDestinationNode = Symbol('node-web-audio-api:audio-destination-node');

class AudioDestinationNode {
  constructor(nativeAudioDestinationNode) {
    this[kNativeAudioDestinationNode] = nativeAudioDestinationNode;
  }

  // AudioNode interface
  get context() {
    return this[kNativeAudioDestinationNode].context;
  }

  get numberOfInputs() {
    return this[kNativeAudioDestinationNode].numberOfInputs;
  }

  get numberOfOutputs() {
    return this[kNativeAudioDestinationNode].numberOfOutputs;
  }

  get channelCount() {
    return this[kNativeAudioDestinationNode].channelCount;
  }

  get channelCountMode() {
    return this[kNativeAudioDestinationNode].channelCountMode;
  }

  get channelInterpretation() {
    return this[kNativeAudioDestinationNode].channelInterpretation;
  }

  // setters

  set channelCount(value) {
    try {
      this[kNativeAudioDestinationNode].channelCount = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  set channelCountMode(value) {
    try {
      this[kNativeAudioDestinationNode].channelCountMode = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  set channelInterpretation(value) {
    try {
      this[kNativeAudioDestinationNode].channelInterpretation = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  // methods - connect / disconnect

  connect(...args) {
    // unwrap raw audio params from facade
    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    // unwrap raw audio destination from facade
    if (args[0] instanceof AudioDestinationNode) {
      args[0] = args[0][kNativeAudioDestinationNode];
    }

    try {
      return this[kNativeAudioDestinationNode].connect(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  disconnect(...args) {
    // unwrap raw audio params from facade
    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    // unwrap raw audio destination from facade
    if (args[0] instanceof AudioDestinationNode) {
      args[0] = args[0][kNativeAudioDestinationNode];
    }

    try {
      return this[kNativeAudioDestinationNode].disconnect(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  get maxChannelCount() {
    return this[kNativeAudioDestinationNode].maxChannelCount;
  }
}

module.exports.kNativeAudioDestinationNode = kNativeAudioDestinationNode;
module.exports.AudioDestinationNode = AudioDestinationNode;

