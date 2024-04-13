
/* eslint-disable no-unused-vars */
const conversions = require("webidl-conversions");
const { toSanitizedSequence } = require('./lib/cast.js');
const { isFunction, kEnumerableProperty } = require('./lib/utils.js');
const { throwSanitizedError } = require('./lib/errors.js');
const { kNapiObj, kAudioBuffer } = require('./lib/symbols.js');
const { bridgeEventTarget } = require('./lib/events.js');
/* eslint-enable no-unused-vars */

const ${d.parent(d.node)} = require('./${d.parent(d.node)}.js');

module.exports = (jsExport, nativeBinding) => {
  class ${d.name(d.node)} extends ${d.parent(d.node)} {
    ${d.audioParams(d.node).map(param => {
      return `
    #${d.name(param)} = null`;
    }).join('')}

    constructor(context, options) {
      ${(function() {
        // handle argument length compared to required arguments
        const numRequired = d.minRequiredArgs(d.constructor(d.node))

        return `
      if (arguments.length < ${numRequired}) {
        throw new TypeError(\`Failed to construct '${d.name(d.node)}': ${numRequired} argument required, but only \${arguments.length}\ present\`);
      }
        `;
      }())}

      ${(function() {
        // handle argument 1: audio context
        const arg = d.constructor(d.node).arguments[0];
        const argType = d.memberType(arg);

          return `
      if (!(context instanceof jsExport.${argType})) {
        throw new TypeError(\`Failed to construct '${d.name(d.node)}': argument 1 is not of type ${argType}\`);
      }
          `;
      }())}

      // parsed version of the option to be passed to NAPI
      const parsedOptions = {};

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
      if (typeof options !== 'object' || (options && options.${optionName} === undefined)) {
        throw new TypeError("Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: Required member is undefined");
      }
          `
          }

          switch (type) {
            case 'boolean':
            case 'float':
            case 'double': {
              checkMember += `
      if (options && options.${optionName} !== undefined) {
        parsedOptions.${optionName} = conversions['${type}'](options.${optionName}, {
          context: \`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value (\${options.${optionName}}})\`,
        });
      } else {
        parsedOptions.${optionName} = ${defaultValue.value};
      }
              `;
              break;
            }
            case 'unsigned long': {
              checkMember += `
      if (options && options.${optionName} !== undefined) {
        parsedOptions.${optionName} = conversions['${type}'](options.${optionName}, {
          enforceRange: true,
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
              // https://webidl.spec.whatwg.org/#idl-enums
              // Note: In the JavaScript binding, assignment of an invalid string value
              // to an attribute is ignored, while passing such a value in other contexts
              // (for example as an operation argument) results in an exception being thrown.

              const typeIdl = d.findInTree(type);
              // check assumptions on parsing
              if (typeIdl.type !== 'enum') {
                throw new Error('should not be parsed as enum value');
              }

              if (defaultValue.type !== 'string') {
                throw new Error(`${type} default value is not a string`);
              }

              const values = JSON.stringify(typeIdl.values.map(e => e.value));

              checkMember += `
      if (options && options.${optionName} !== undefined) {
        if (!${values}.includes(options.${optionName})) {
          throw new TypeError(\`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value '\${options.${optionName}}' is not a valid enum value of type ${type}\`);
        }

        parsedOptions.${optionName} = conversions['DOMString'](options.${optionName}, {
          context: \`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value '\${options.${optionName}}'\`,
        });
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
      if (options && options.${optionName} !== undefined) {
        if (!(options.${optionName} instanceof jsExport.PeriodicWave)) {
          throw new TypeError(\`Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value '\${options.${optionName}}' is not an instance of ${type}\`);
        }

        parsedOptions.${optionName} = options.${optionName}[kNapiObj];
      } else {
        parsedOptions.${optionName} = ${defaultValue};
      }
              `;
              break;
            }
            // audio buffer requires special handling because of its wrapper
            case 'AudioBuffer': {
              checkMember += `
      if (options && options.${optionName} !== undefined) {
        if (options.${optionName} !== null) {
          if (!(options.${optionName} instanceof jsExport.AudioBuffer)) {
            throw new TypeError("Failed to construct '${d.name(d.node)}': Failed to read the '${optionName}' property from ${optionsType}: The provided value cannot be converted to 'AudioBuffer'");
          }

          // unwrap napi audio buffer
          parsedOptions.${optionName} = options.${optionName}[kNapiObj];
        } else {
          parsedOptions.${optionName} = ${defaultValue};
        }
      } else {
        parsedOptions.${optionName} = ${defaultValue};
      }
              `;
              break;
            }
            default: {
              // - IIRFilterNode::feedback
              // - IIRFilterNode::feedforward
              // - WaveShaperNode:::curve
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
      if (options && options.${optionName} !== undefined) {
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

        // handle spacial cases
        if (d.name(d.node) === 'OscillatorNode') {
          // https://webaudio.github.io/web-audio-api/#dom-oscillatoroptions-type
          checkOptions += `
      if (parsedOptions.type === 'custom' && parsedOptions.periodicWave === null) {
        throw new DOMException("Failed to construct 'OscillatorNode': A PeriodicWave must be specified if the type is set to 'custom'", 'InvalidStateError');
      }

      if (parsedOptions.periodicWave !== null) {
        parsedOptions.type = 'custom';
      }

          `;
        }

        // audio node options
        if (d.parent(optionsIdl) === 'AudioNodeOptions') {
          // Real check is done on rust side, let's just convert values to proper IDL type
          checkOptions += `
        if (options && options.channelCount !== undefined) {
          parsedOptions.channelCount = conversions['unsigned long'](options.channelCount, {
            enforceRange: true,
            context: \`Failed to construct '${d.name(d.node)}': Failed to read the 'channelCount' property from ${optionsType}: The provided value '\${options.channelCount}'\`,
          });
        }

        if (options && options.channelCountMode !== undefined) {
          parsedOptions.channelCountMode = conversions['DOMString'](options.channelCountMode, {
            context: \`Failed to construct '${d.name(d.node)}': Failed to read the 'channelCount' property from ${optionsType}: The provided value '\${options.channelCountMode}'\`,
          });
        }

        if (options && options.channelInterpretation !== undefined) {
          parsedOptions.channelInterpretation = conversions['DOMString'](options.channelInterpretation, {
            context: \`Failed to construct '${d.name(d.node)}': Failed to read the 'channelInterpretation' property from ${optionsType}: The provided value '\${options.channelInterpretation}'\`,
          });
        }
          `;
        }

        return checkOptions;
      }())}

      let napiObj;

      try {
        napiObj = new nativeBinding.${d.name(d.node)}(context[kNapiObj], parsedOptions);
      } catch (err) {
        throwSanitizedError(err);
      }

      super(context, { [kNapiObj]: napiObj });

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

      if (options && options.${optionName} !== undefined) {
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
      this.#${d.name(param)} = new jsExport.AudioParam({
        [kNapiObj]: this[kNapiObj].${d.name(param)},
      });`;
      }).join('')}
    }

${d.audioParams(d.node).map(param => {
  return `
    get ${d.name(param)}() {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      return this.#${d.name(param)};
    }
  `;
}).join('')}

${d.attributes(d.node).map(attr => {
  // ------------------------------------------------------
  // Getters / Setters
  // ------------------------------------------------------
  const type = attr.idlType.idlType;

  let getter = ``;
  let setter = ``;

  switch (type) {
    // @todo - other special cases
    // - Float32Array
    // - MediaStream
    case 'AudioBuffer': {
      getter = `
    get ${d.name(attr)}() {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      return this[kAudioBuffer];
    }
      `;
      break;
    }
    default: {
      getter = `
    get ${d.name(attr)}() {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      return this[kNapiObj].${d.name(attr)};
    }
      `;
      break;
    }
  }

  // ------------------------------------------------------
  // Setters
  // ------------------------------------------------------
  if (!attr.readonly) {
    // nullable:
    // - Float32Array - WaveshaperNode::curve
    // - AudioBuffer - AudiobufferSourceNode::buffer & ConvolverNode::buffer
    const nullable = attr.idlType.nullable;

    switch (type) {
      case 'boolean':
      case 'float':
      case 'double': {
        setter = `
    set ${d.name(attr)}(value) {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      value = conversions['${type}'](value, {
        context: \`Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': Value\`
      });

      try {
        this[kNapiObj].${d.name(attr)} = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
        `;
        break;
      }
      case 'unsigned long': {
        // - Analyser::fftSize
        setter = `
    set ${d.name(attr)}(value) {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      // @fixme - wpt pretends that when set to -1, this should throw IndexSizeError, not a TypeError.
      // For now let's just cast it to Number without further checks, and let Rust do the job
      // as 0 is an invalid value too
      // value = conversions['${type}'](value, {
      //   enforceRange: true,
      //   context: \`Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': Value\`
      // });
      value = conversions['unrestricted double'](value, {
        context: \`Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': Value\`
      });

      try {
        this[kNapiObj].${d.name(attr)} = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
        `;
        break;
      }
      case 'BiquadFilterType':
      case 'OscillatorType':
      case 'PanningModelType':
      case 'DistanceModelType':
      case 'OverSampleType': {
        // https://webidl.spec.whatwg.org/#idl-enums
        // Note: In the JavaScript binding, assignment of an invalid string value
        // to an attribute is ignored, while passing such a value in other contexts
        // (for example as an operation argument) results in an exception being thrown.
        const typeIdl = d.findInTree(type);
        const values = JSON.stringify(typeIdl.values.map(e => e.value));

        setter = `
    set ${d.name(attr)}(value) {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      if (!${values}.includes(value)) {
        console.warn(\`Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': Value '\${value}' is not a valid '${type}' enum value\`);
        return;
      }

      try {
        this[kNapiObj].${d.name(attr)} = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
        `;
        break;
      }
      case 'Float32Array': {
        // - WaveShaperNode::curve
        // @todo - should be able to set back to null
        setter = `
    set ${d.name(attr)}(value) {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      if (value === null) {
        console.warn("Setting the '${d.name(attr)}' property on '${d.name(d.node)}' to 'null' is not supported yet");
        return;
      } else if (!(value instanceof ${type})) {
        throw new TypeError("Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': Value is not a valid '${type}' value");
      }

      try {
        this[kNapiObj].${d.name(attr)} = value;
      } catch (err) {
        throwSanitizedError(err);
      }
    }
        `;
        break;
      }
      case 'AudioBuffer': {
        // - AudioBufferSourceNode::buffer
        // - ConvolverNode::buffer
        // @todo - should be able to set back to null
        setter = `
    set ${d.name(attr)}(value) {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      if (value === null) {
        console.warn("Setting the '${d.name(attr)}' property on '${d.name(d.node)}' to 'null' is not supported yet");
        return;
      } else if (!(kNapiObj in value)) {
        throw new TypeError("Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': Failed to convert value to '${type}'");
      }

      try {
        this[kNapiObj].${d.name(attr)} = value[kNapiObj];
      } catch (err) {
        throwSanitizedError(err);
      }

      this[kAudioBuffer] = value;
    }
        `;
        break;
      }
      default: {
        console.log(`Warning: Unhandled type '${type}' in setters`);
        break;
      }
    }
  }

  return `${getter}${setter}`;
}).join('')}

${d.methods(d.node, false).map(method => {
    const numRequired = d.minRequiredArgs(method);
    const args = method.arguments;

    return `
    ${d.name(method)}(${args.map(arg => arg.optional ? `${arg.name} = ${arg.default !== null ? arg.default.value : 'null'}` : arg.name).join(', ')}) {
      if (!(this instanceof ${d.name(d.node)})) {
        throw new TypeError("Invalid Invocation: Value of 'this' must be of type '${d.name(d.node)}'");
      }

      ${numRequired > 0 ? `
      if (arguments.length < ${numRequired}) {
        throw new TypeError(\`Failed to execute '${d.name(method)}' on '${d.name(d.node)}': ${numRequired} argument required, but only \${arguments.length}\ present\`);
      }` : ``}

      ${method.arguments.map((argument, index) => {
        const name = d.name(argument);
        const type = argument.idlType.idlType;

        let argCheck = ``;

        switch (type) {
          case 'float':
          case 'double': {
            argCheck += `
      ${name} = conversions['${type}'](${name}, {
        context: \`Failed to execute '${d.name(method)}' on '${d.name(d.node)}': Parameter ${index + 1}\`,
      });
            `;
            break;
          }
          case 'Float32Array':
          case 'Uint8Array': {
            argCheck += `
      if (!(${name} instanceof ${type})) {
        throw new TypeError(\`Failed to execute '${d.name(method)}' on '${d.name(d.node)}': Parameter ${index + 1} is not of type '${type}'\`);
      }
            `;
            break;
          }
          case 'PeriodicWave': {
            argCheck += `
      if (!(${name} instanceof jsExport.PeriodicWave)) {
        throw new TypeError(\`Failed to execute '${d.name(method)}' on '${d.name(d.node)}': Parameter ${index + 1} is not of type 'PeriodicWave'\`);
      }

      ${name} = ${name}[kNapiObj];
            `;
            break;
          }
          default: {
            console.log('unhandle type', type, 'in method', d.name(method));
            break;
          }
        }

        // if argument is optionnal, cf. AudioBufferSourceNode::start, do the
        // conversion only if argument is different from default value
        if (argument.optional) {
          const defaultValue = argument.default !== null ? argument.default.value : null;

          argCheck = `
      if (${name} !== ${defaultValue}) { ${argCheck} }
          `;
        }

        return argCheck;
      }).join('')}

      try {
        return this[kNapiObj].${d.name(method)}(${args.map(arg => arg.name).join(', ')});
      } catch (err) {
        throwSanitizedError(err);
      }
    }
`}).join('')}
  }

${(function() {
  // length defines the minimum required number of argument of the constructor
  // "The value of the Function object’s “length” property is
  // a Number determined as follows:
  // "Return the length of the shortest argument list of the entries in S."
  return `
  Object.defineProperties(${d.name(d.node)}, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: ${d.minRequiredArgs(d.constructor(d.node))}
    },
  });

  Object.defineProperties(${d.name(d.node)}.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: '${d.name(d.node)}',
    },
    ${d.audioParams(d.node).map(param => {
      return `${d.name(param)}: kEnumerableProperty,`;
    }).join('')}
    ${d.attributes(d.node).map(attr => {
      return `${d.name(attr)}: kEnumerableProperty,`;
    }).join('')}
    ${d.methods(d.node, false).map(method => {
      return `${d.name(method)}: kEnumerableProperty,`;
    }).join('')}
  });
  `;
}())}

  return ${d.name(d.node)};
};

