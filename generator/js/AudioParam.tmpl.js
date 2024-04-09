const conversions = require("webidl-conversions");

const { toSanitizedSequence } = require('./lib/cast.js');
const { throwSanitizedError } = require('./lib/errors.js');
const { kEnumerableProperty, kHiddenProperty } = require('./lib/utils.js');
const { kNativeAudioParam } = require('./lib/symbols.js');

class AudioParam {
  constructor(nativeAudioParam) {
    if (nativeAudioParam['Symbol.toStringTag'] !== 'AudioParam') {
      throw new TypeError('Illegal constructor');
    }

    Object.defineProperty(this, kNativeAudioParam, {
      value: nativeAudioParam,
      ...kHiddenProperty,
    });
  }
  // getters
${d.attributes(d.node).map(attr => {
  return `
  get ${d.name(attr)}() {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
    }

    return this[kNativeAudioParam].${d.name(attr)};
  }
`}).join('')}
  // setters
${d.attributes(d.node).filter(attr => !attr.readonly).map(attr => {
  // float or AutomationRate
  const type = attr.idlType.idlType;
  const castType = type === 'float' ? 'float' : 'string';

  return `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
    }

    ${type === 'float' ? `
    value = conversions['${type}'](value, {
      context: \`Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': The provided ${type} value\`,
    });
    ` : ``}

    try {
      this[kNativeAudioParam].${d.name(attr)} = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }
`}).join('')}
  // methods
${d.methods(d.node, false)
  .reduce((acc, method) => {
    // dedup method names
    if (!acc.find(i => d.name(i) === d.name(method))) {
      acc.push(method)
    }
    return acc;
  }, []).map(method => {
    const numRequired = d.minRequiredArgs(method);
    const argumentNames = method.arguments.filter(arg => arg.optional === false).map(d.name);
    // make sure we can assume that all arguments are required
    if (argumentNames.length !== method.arguments.length) {
      console.log(`> Warning: optionnal argument for ${d.name(method)}`)
    }

    return `
  ${d.name(method)}(${argumentNames.join(', ')}) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
    }

    if (arguments.length < ${numRequired}) {
      throw new TypeError(\`Failed to execute '${d.name(method)}' on '${d.name(d.node)}': ${numRequired} argument required, but only \${arguments.length}\ present\`);
    }

    ${method.arguments.map((argument, index) => {
      const name = d.name(argument);
      const type = argument.idlType.idlType;

      switch (type) {
        case 'float':
        case 'double': {
          return `
    ${name} = conversions['${type}'](${name}, {
      context: \`Failed to execute '${d.name(method)}' on '${d.name(d.node)}': Parameter ${index + 1}\`,
    });
          `;
          break;
        }
        default: {
          if (argument.idlType.generic === 'sequence' && argument.idlType.idlType[0].idlType === 'float') {
            return `
    try {
      ${name} = toSanitizedSequence(${name}, Float32Array);
    } catch (err) {
      throw new TypeError(\`Failed to execute '${d.name(method)}': Parameter ${index + 1} \${err.message}\`);
    }
            `;
          } else {
            console.log(`> Warning: argument type not handled`);
            d.debug(argument);
          }
          break;
        }
      }
    }).join('')}

    try {
      this[kNativeAudioParam].${d.name(method)}(${argumentNames.join(', ')});
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }
    `
  }).join('')}
}

Object.defineProperties(AudioParam, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioParam.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioParam',
  },

  ${d.attributes(d.node).map(attr => {
    return `${d.name(attr)}: kEnumerableProperty,`;
  }).join('')}

  ${d.methods(d.node, false).reduce((acc, method) => {
    // dedup method names
    if (!acc.find(i => d.name(i) === d.name(method))) {
      acc.push(method)
    }
    return acc;
  }, []).map(method => {
    return `${d.name(method)}: kEnumerableProperty,`;
  }).join('')}

});


module.exports = AudioParam;

