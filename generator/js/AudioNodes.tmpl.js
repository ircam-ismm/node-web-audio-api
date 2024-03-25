
/* eslint-disable no-unused-vars */
const conversions = require("webidl-conversions");
const { toSanitizedSequence } = require('./lib/cast.js');
const { isFunction } = require('./lib/utils.js');
const { throwSanitizedError } = require('./lib/errors.js');

const { AudioParam } = require('./AudioParam.js');
const { kNativeAudioBuffer, kAudioBuffer } = require('./AudioBuffer.js');
const { kNapiObj } = require('./lib/symbols.js');
const { bridgeEventTarget } = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const ${d.parent(d.node)} = require('./${d.parent(d.node)}.js');

module.exports = (jsExport, nativeBinding) => {
  class ${d.name(d.node)} extends ${d.parent(d.node)} {
    constructor(context, options) {
      ${(function() {
        // handle argument length compared to required arguments
        const numRequired = d.constructor(d.node).arguments
          .reduce((acc, value) => acc += (value.optional ? 0 : 1), 0);

        return `
      if (arguments.length < ${numRequired}) {
        throw new TypeError(\`Failed to construct '${d.name(d.node)}': ${numRequired} argument required, but only \${arguments.length}\ present\`);
      }
        `;
      }())}

      ${(function() {
        // handle audio context
        const arg = d.constructor(d.node).arguments[0];
        const argType = d.memberType(arg);
        const argIdl = d.findInTree(argType);

      //   // BaseAudioContext is not exposed and is created dynamically so we
      //   // need this workaround
      //   if (argType === 'BaseAudioContext') {
      //     return `
      // if (!(context instanceof jsExport.AudioContext) && !(context instanceof jsExport.OfflineAudioContext)) {
      //   throw new TypeError(\`Failed to construct '${d.name(d.node)}': argument 1 is not of type ${argType}\`);
      // }
      //     `;
      //   } else {
          return `
      if (!(context instanceof jsExport.${argType})) {
        throw new TypeError(\`Failed to construct '${d.name(d.node)}': argument 1 is not of type ${argType}\`);
      }
          `;
        // }
      }())}
      // parsed version of the option to be passed to NAPI
      const parsedOptions = Object.assign({}, options);

      ${(function() {
        // handle argument 2: options
        const optionsArg = d.constructor(d.node).arguments[1];
        const optionsType = d.memberType(optionsArg);
        const optionsIdl = d.findInTree(optionsType);
        let checkOptions = `
      if (options && typeof options !== 'object') {
        throw new TypeError("Failed to construct '${d.name(d.node)}': argument 2 is not of type '${optionsType}'");
      }
        `;

        checkOptions += optionsIdl.members.map(member => {
          const optionName = d.name(member);
          const type = d.memberType(member);
          const required = member.required;
          const defaultValue = member.default; // null or object
          // only AudioBuffer is actually nullable
          const nullable = member.idlType.nullable;
          let checkMember = '';

          if (required) {
          checkMember += `
      // required options
      if (typeof options !== 'object' || (options && !('${optionName}' in options))) {
        throw new TypeError("Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}'' property from ${optionsType}: Required member is undefined");
      }
          `
          }

          switch (type) {
            case 'boolean':
            case 'float':
            case 'double':
            case 'unsigned long': {
              checkMember += `
      if (options && '${optionName}' in options) {
        parsedOptions.${optionName} = conversions['${type}'](options.${optionName}, {
          context: \`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value (\${options.${optionName}}})\`,
        });
      } else {
        parsedOptions.${optionName} = ${defaultValue.value};
      }
              `;
              break;
            }
            // enum
            case 'BiquadFilterType':
            case 'OscillatorType':
            case 'PanningModelType':
            case 'DistanceModelType':
            case 'OverSampleType': {
              const typeIdl = d.findInTree(type);
              // check assumptions on parsing
              if (typeIdl.type !== 'enum') {
                throw new Error('should not be parsed as enum value');
              }

              if (defaultValue.type !== 'string') {
                throw new Error(`${type} default value is not a string`);
              }

              const values = JSON.stringify(typeIdl.values.map(e => e.value))

              checkMember += `
      if (options && '${optionName}' in options) {
        if (!${values}.includes(options.${optionName})) {
          throw new TypeError(\`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value '\${options.${optionName}}' is not a valid enum value of type ${type}\`);
        }

        parsedOptions.${optionName} = options.${optionName};
      } else {
        parsedOptions.${optionName} = '${defaultValue.value}';
      }
              `;
              break;
            }
            case 'MediaStream': {
              // @todo - MediaStream is not properly wrapped yet so we cannot
              // properly check it. Just pass as is to NAPI for now
              // Note that the option is required
              checkMember += `
      parsedOptions.${optionName} = options.${optionName};
              `;
              break;
            }
            case 'PeriodicWave': {
              checkMember += `
      if (options && '${optionName}' in options) {
        if (!(options.${optionName} instanceof jsExport.PeriodicWave)) {
          throw new TypeError(\`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value '\${options.${optionName}}' is not an instance of ${type}\`);
        }

        parsedOptions.${optionName} = options.${optionName};
      } else {
        parsedOptions.${optionName} = ${defaultValue};
      }
              `;
              break;
            }
            // audio buffer requires special handling because of its wrapper
            case 'AudioBuffer': {
              checkMember += `
      if (options && '${optionName}' in options) {
        if (options.${optionName} !== null) {
          // if (!(kNativeAudioBuffer in options.${optionName})) {
          if (!(options.${optionName} instanceof jsExport.AudioBuffer)) {
            throw new TypeError("Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value cannot be converted to 'AudioBuffer'");
          }

          // unwrap napi audio buffer
          parsedOptions.${optionName} = options.${optionName}[kNativeAudioBuffer];
        }
      } else {
        parsedOptions.${optionName} = ${defaultValue};
      }
              `;
              break;
            }
            default: {
              // make sure we handle all other types
              if (member.idlType.type !== 'dictionary-type' || member.idlType.generic !== 'sequence') {
                throw new Error(`${type} is not of a dictionary-type sequence`);
              }

              let targetType;

              if (member.idlType.idlType[0].idlType === 'float') {
                targetType = 'Float32Array';
              } else if (member.idlType.idlType[0].idlType === 'double') {
                targetType = 'Float64Array';
              } else {
                throw new Error(`${type}: Unhandled sequence of ${member.idlType.idlType[0].idlType}`);
              }

              // if the value is required, it should have failed earlier
              checkMember += `
      if (options && '${optionName}' in options) {
        try {
          parsedOptions.${optionName} = toSanitizedSequence(options.${optionName}, ${targetType});
        } catch (err) {
          throw new TypeError(\`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value \${err.message}\`);
        }
      } else {
        parsedOptions.${optionName} = ${defaultValue};
      }
              `;

              break;
            }
          }

          return checkMember;
        }).join('');

        return checkOptions;
      }())}

      let napiObj;

      try {
        napiObj = new nativeBinding.${d.name(d.node)}(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, napiObj);

      ${(function() {
        // handle special options cases
        const options = d.constructor(d.node).arguments[1];
        const optionsType = d.memberType(options);
        const optionsIdl = d.findInTree(optionsType);

        return optionsIdl.members.map(member => {
          // at this point all type checks have been done, so it is safe to just manipulate the options
          const optionName = d.name(member);
          const type = d.memberType(member);
          if (type === 'AudioBuffer') {
            return `
      // keep the wrapped AudioBuffer around
      this[kAudioBuffer] = null;

      if (options && '${optionName}' in options) {
        this[kAudioBuffer] = options.${optionName};
      }
            `;
          }
        }).join('');
      }())}

      ${d.parent(d.node) === 'AudioScheduledSourceNode' ? `
      // Bridge Rust native event to Node EventTarget
      bridgeEventTarget(this);` : ``}

      ${d.audioParams(d.node).map(param => {
        return `
      this.${d.name(param)} = new AudioParam(this[kNapiObj].${d.name(param)});`;
      }).join('')}
    }

${d.attributes(d.node).map(attr => {
  // ------------------------------------------------------
  // Getters
  // ------------------------------------------------------
  switch (d.memberType(attr)) {
    case 'AudioBuffer': {
      return `
    get ${d.name(attr)}() {
      return this[kAudioBuffer];
    }
      `;
      break;
    }
    default: {
      return `
    get ${d.name(attr)}() {
      return this[kNapiObj].${d.name(attr)};
    }
      `;
      break;
    }
  }
}).join('')}

${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  // ------------------------------------------------------
  // Setters
  // ------------------------------------------------------
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
        this[kNapiObj].${d.name(attr)} = value[kNativeAudioBuffer];
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
        this[kNapiObj].${d.name(attr)} = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
      `;
      break;
    }
  }
}).join('')}

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
        return this[kNapiObj].${d.name(method)}(...args);
      } catch (err) {
        throwSanitizedError(err);
      }
    }
`}).join('')}
  }

  return ${d.name(d.node)};
};

