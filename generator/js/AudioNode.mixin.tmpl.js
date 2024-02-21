const { throwSanitizedError } = require('./lib/errors.js');

const { AudioParam, kNativeAudioParam } = require('./AudioParam.js');
const { AudioDestinationNode, kNativeAudioDestinationNode } = require('./AudioDestinationNode.js');

module.exports = (superclass) => {
  class ${d.name(d.node)} extends superclass {
    /* eslint-disable constructor-super */
    constructor(...args) {
      try {
        super(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
    /* eslint-enable constructor-super */

    // getters
${d.attributes(d.node).map(attr => {
  return `
    get ${d.name(attr)}() {
      return super.${d.name(attr)};
    }
`}).join('')}
    // setters
${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  return `
    set ${d.name(attr)}(value) {
      try {
        super.${d.name(attr)} = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
`}).join('')}
    // methods - connect / disconnect
    ${d.methods(d.node, false).reduce((acc, method) => {
      // dedup method names
      if (!acc.find(i => d.name(i) === d.name(method))) {
        acc.push(method)
      }
      return acc;
    }, []).map(method => {
  return `
    ${d.name(method)}(...args) {
      // unwrap raw audio params from facade
      if (args[0] instanceof AudioParam) {
        args[0] = args[0][kNativeAudioParam];
      }

      // unwrap raw audio destination from facade
      if (args[0] instanceof AudioDestinationNode) {
        args[0] = args[0][kNativeAudioDestinationNode];
      }

      try {
        return super.${d.name(method)}(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
`}).join('')}
  }

  return ${d.name(d.node)};
};
