// eslint-disable-next-line no-unused-vars
const { throwSanitizedError } = require('./lib/errors.js');
// eslint-disable-next-line no-unused-vars
const { AudioParam } = require('./AudioParam.js');
const EventTargetMixin = require('./EventTarget.mixin.js');
const AudioNodeMixin = require('./AudioNode.mixin.js');
${d.parent(d.node) === 'AudioScheduledSourceNode' ?
`const AudioScheduledSourceNodeMixin = require('./AudioScheduledSourceNode.mixin.js');`: ``}

const { kNativeAudioBuffer, kAudioBuffer } = require('./AudioBuffer.js');

module.exports = (Native${d.name(d.node)}) => {
  const EventTarget = EventTargetMixin(Native${d.name(d.node)}, ['ended']);
  const AudioNode = AudioNodeMixin(EventTarget);
${d.parent(d.node) === 'AudioScheduledSourceNode' ? `\
  const AudioScheduledSourceNode = AudioScheduledSourceNodeMixin(AudioNode);

  class ${d.name(d.node)} extends AudioScheduledSourceNode {` : `
  class ${d.name(d.node)} extends AudioNode {`
}
    constructor(context, options) {
      ${(function() {
        // handle argument 2: options
        const options = d.constructor(d.node).arguments[1];
        const optionsType = d.memberType(options);
        const optionsIdl = d.findInTree(optionsType);
        let checkOptions = `
      if (options !== undefined) {
        if (typeof options !== 'object') {
          throw new TypeError("Failed to construct '${d.name(d.node)}': argument 2 is not of type '${optionsType}'")
        }
        `;

        checkOptions += optionsIdl.members.map(member => {
          // @todo - improve checks
          // cf. https://github.com/jsdom/webidl-conversions
          const optionName = d.name(member);
          const type = d.memberType(member);
          const required = member.required;
          const nullable = member.idlType.nullable;
          const defaultValue = member.default; // null or object
          let checkMember = '';

          if (required) {
          checkMember += `
        if (options && !('${optionName}' in options)) {
          throw new Error("Failed to read the '${optionName}'' property from ${optionsType}: Required member is undefined.")
        }
          `
          }

          // d.debug(member);
          switch (type) {
            case 'AudioBuffer': {
              checkMember += `
        if ('${optionName}' in options && options.${optionName} !== null && !(kNativeAudioBuffer in options.${optionName} )) {
          throw new TypeError("Failed to set the 'buffer' property on 'AudioBufferSourceNode': Failed to convert value to 'AudioBuffer'");
        }
        // unwrap napi audio buffer, clone the options object as it might be reused
        options = Object.assign({}, options);
        options.${optionName} = options.${optionName}[kNativeAudioBuffer];
              `;
              break;
            }
          }

          return checkMember;
        }).join('');

        checkOptions += `
      }
        `;

        return checkOptions;
      }())}

      super(context, options);

      ${(function() {
        // handle special options cases
        const options = d.constructor(d.node).arguments[1];
        const optionsType = d.memberType(options);
        const optionsIdl = d.findInTree(optionsType);

        return optionsIdl.members.map(member => {
          // at this point all type checks have been done, so it is safe to just manipulate the options
          const optionName = d.name(member);
          const type = d.memberType(member);
          // for audio buffer, we need to keep the wrapper around
          if (type === 'AudioBuffer') {
            return `
      if (options && '${optionName}' in options) {
        this[kAudioBuffer] = options.${optionName};
      }
            `;
          }
        }).join('');
      }())}

      ${d.parent(d.node) === 'AudioScheduledSourceNode' ? `
      // EventTargetMixin constructor has been called so EventTargetMixin[kDispatchEvent]
      // is bound to this, then we can safely finalize event target initialization
      super.__initEventTarget__();` : ``}

      ${d.audioParams(d.node).map(param => {
        return `
      this.${d.name(param)} = new AudioParam(this.${d.name(param)});`;
      }).join('')}
    }

    // getters
${d.attributes(d.node).map(attr => {
  switch (d.memberType(attr)) {
    case 'AudioBuffer': {
      return `
    get ${d.name(attr)}() {
      if (this[kAudioBuffer]) {
        return this[kAudioBuffer];
      } else {
        return null;
      }
    }
      `;
      break;
    }
    default: {
      return `
    get ${d.name(attr)}() {
      return super.${d.name(attr)};
    }
      `;
      break;
    }
  }
}).join('')}
    // setters
${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  switch (d.memberType(attr)) {
    case 'AudioBuffer': {
      return `
    // @todo - should be able to set to null afterward
    set ${d.name(attr)}(value) {
      if (value === null) {
        return;
      } else if (!(kNativeAudioBuffer in value)) {
        throw new TypeError("Failed to set the 'buffer' property on 'AudioBufferSourceNode': Failed to convert value to 'AudioBuffer'");
      }

      try {
        super.${d.name(attr)} = value[kNativeAudioBuffer];
      } catch (err) {
        throwSanitizedError(err);
      }

      this[kAudioBuffer] = value;
    }
      `;
      break;
    }
    default: {
      return `
    set ${d.name(attr)}(value) {
      try {
        super.${d.name(attr)} = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
      `;
      break;
    }
  }
}).join('')}

    // methods
${d.methods(d.node, false)
  .reduce((acc, method) => {
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

