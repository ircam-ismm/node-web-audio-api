const { throwSanitizedError } = require('./lib/errors.js');

const kNativeAudioParam = Symbol('node-web-audio-api:audio-param');

class AudioParam {
  constructor(nativeAudioParam) {
    this[kNativeAudioParam] = nativeAudioParam;
  }
  // getters
${d.attributes(d.node).map(attr => {
  return `
  get ${d.name(attr)}() {
    return this[kNativeAudioParam].${d.name(attr)};
  }
`}).join('')}
  // setters
${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  return `
  set ${d.name(attr)}(value) {
    try {
      this[kNativeAudioParam].${d.name(attr)} = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }
`}).join('')}
  // methods
${d.methods(d.node, false).reduce((acc, method) => {
  // dedup method names
  if (!acc.find(i => d.name(i) === d.name(method))) {
    acc.push(method)
  }
  return acc;
}, []).map(method => {
  return `
  ${d.name(method)}(...args) {
    try {
      return this[kNativeAudioParam].${d.name(method)}(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
`}).join('')}
}

module.exports.kNativeAudioParam = kNativeAudioParam;
module.exports.AudioParam = AudioParam;

