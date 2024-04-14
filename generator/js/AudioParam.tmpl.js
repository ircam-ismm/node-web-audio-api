const conversions = require("webidl-conversions");

const { toSanitizedSequence } = require('./lib/cast.js');
const { throwSanitizedError } = require('./lib/errors.js');

const { kEnumerableProperty, kHiddenProperty } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');

class AudioParam {
  constructor(options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
      || options[kNapiObj]['Symbol.toStringTag'] !== 'AudioParam'
    ) {
      throw new TypeError('Illegal constructor');
    }

    Object.defineProperty(this, kNapiObj, {
      value: options[kNapiObj],
      ...kHiddenProperty,
    });
  }

${d.attributes(d.node).map(attr => {
  let getter = ``;
  let setter = ``;

  getter = `
  get ${d.name(attr)}() {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
    }

    return this[kNapiObj].${d.name(attr)};
  }
  `;

  if (!attr.readonly) {
    const type = attr.idlType.idlType;

    switch (type) {
      case 'float': {
        setter = `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
    }

    value = conversions['${type}'](value, {
      context: \`Failed to set the '${d.name(attr)}' property on '${d.name(d.node)}': The provided ${type} value\`,
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
      case 'AutomationRate': {
        const typeIdl = d.findInTree(type);
        const values = JSON.stringify(typeIdl.values.map(e => e.value));

        setter = `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioParam'");
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
    const argumentNames = method.arguments.filter(arg => arg.optional === false).map(d.name);
    // make sure we can assume that all arguments are required
    if (argumentNames.length !== method.arguments.length) {
      console.log(`Warning: Unhandled optionnal argument for ${d.name(method)}`)
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
      this[kNapiObj].${d.name(method)}(${argumentNames.join(', ')});
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
  ${d.methods(d.node, false).map(method => {
    return `${d.name(method)}: kEnumerableProperty,`;
  }).join('')}
});


module.exports = AudioParam;

