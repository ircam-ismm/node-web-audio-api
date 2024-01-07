const { throwSanitizedError } = require('./lib/errors.js');

const { AudioParam } = require('./AudioParam.js');
const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');
${d.parent(d.node) === 'AudioScheduledSourceNode' ?
`const AudioScheduledSourceNodeMixin = require('./AudioScheduledSourceNode.mixin.js');`: ``}

module.exports = (Native${d.name(d.node)}) => {
${d.parent(d.node) === 'AudioScheduledSourceNode' ? `
  const EventTarget = EventTargetMixin(Native${d.name(d.node)}, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);
  const AudioScheduledSourceNode = AudioScheduledSourceNodeMixin(AudioNode);

  class ${d.name(d.node)} extends AudioScheduledSourceNode {
    constructor(context, options) {
      super(context, options);
      // EventTargetMixin has been called so EventTargetMixin[kDispatchEvent] is
      // bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();
${d.audioParams(d.node).map(param => {
    return `
      this.${d.name(param)} = new AudioParam(this.${d.name(param)});`;
}).join('')}
    }
`: `
  const EventTarget = EventTargetMixin(Native${d.name(d.node)});
  const AudioNode = AudioNodeMixin(EventTarget);

  class ${d.name(d.node)} extends AudioNode {
    constructor(context, options) {
      super(context, options);
${d.audioParams(d.node).map(param => {
    return `
      this.${d.name(param)} = new AudioParam(this.${d.name(param)});`;
}).join('')}
    }
`}
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
    }, [])
    // filter AudioScheduledSourceNode methods to prevent re-throwing errors
    .filter(method => d.name(method) !== 'start' && d.name(method) !== 'stop')
    .map(method => {
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
};

