const { throwSanitizedError } = require('./lib/errors.js');
const { isFunction } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');

const AudioNode = require('./AudioNode.js');

class AudioScheduledSourceNode extends AudioNode {
  constructor(context, napiObj) {
    super(context, napiObj);
  }
${d.attributes(d.node).map(attr => {
  // onended events
  return `
  get ${d.name(attr)}() {
    return this._${d.name(attr)} || null;
  }
  `}).join('')}

${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  // onended events
  return `
  set ${d.name(attr)}(value) {
    if (isFunction(value) || value === null) {
      this._${d.name(attr)} = value;
    }
  }
  `}).join('')}

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
      return this[kNapiObj].${d.name(method)}(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
  `}).join('')}
}

module.exports = AudioScheduledSourceNode;
