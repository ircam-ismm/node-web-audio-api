const { throwSanitizedError } = require('./lib/errors.js');

module.exports = (superclass) => {
  class ${d.name(d.node)} extends superclass {
    constructor(...args) {
      try {
        super(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
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
        return super.${d.name(method)}(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
`}).join('')}
  }

  return ${d.name(d.node)};
}
