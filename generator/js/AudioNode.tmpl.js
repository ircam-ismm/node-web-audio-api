const conversions = require("webidl-conversions");

const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kEnumerableProperty,
  kHiddenProperty,
} = require('./lib/utils.js');
const {
  kNapiObj
} = require('./lib/symbols.js');

const AudioParam = require('./AudioParam.js');

class AudioNode extends EventTarget {
  #context = null;

  constructor(context, options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
    ) {
      throw new TypeError('Illegal constructor');
    }

    super(options[kNapiObj]);

    this.#context = context;

    Object.defineProperty(this, kNapiObj, {
      value: options[kNapiObj],
      ...kHiddenProperty,
    });
  }

  get context() {
    return this.#context;
  }

${d.attributes(d.node).filter(attr => d.name(attr) !== 'context').map(attr => {
  let getter = ``;
  let setter = ``;

  getter = `
  get ${d.name(attr)}() {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
    }

    return this[kNapiObj].${d.name(attr)};
  }
  `;

  if (!attr.readonly) {
    const type = attr.idlType.idlType;

    switch (type) {
      case 'unsigned long': {
        setter = `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
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
      case 'ChannelCountMode':
      case 'ChannelInterpretation': {
        const typeIdl = d.findInTree(type);
        const values = JSON.stringify(typeIdl.values.map(e => e.value));

        setter = `
  set ${d.name(attr)}(value) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
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

  // ------------------------------------------------------
  // connect / disconnect
  // ------------------------------------------------------

  // AudioNode connect (AudioNode destinationNode,
  //                    optional unsigned long output = 0,
  //                    optional unsigned long input = 0);
  // undefined connect (AudioParam destinationParam, optional unsigned long output = 0);

  connect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
    }

    if (arguments.length < 1) {
      throw new TypeError(\`Failed to execute 'connect' on 'AudioNode': 1 argument required, but only \${arguments.length} present\`);
    }

    let destination;
    let output;
    let input;

    // note that audio listener params are not wrapped
    if (args[0] instanceof AudioNode) {
      destination = args[0][kNapiObj];

      if (args[1] !== undefined) {
        output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: "Failed to execute 'connect' on 'AudioNode':",
        });
      } else {
        output = 0;
      }

      if (args[2] !== undefined) {
        input = conversions['unsigned long'](args[2], {
          enforceRange: true,
          context: "Failed to execute 'connect' on 'AudioNode':",
        });
      } else {
        input = 0;
      }
    } else if (args[0] instanceof AudioParam) {
      if (arguments.length > 2) {
        throw new TypeError("Failed to execute 'connect' on 'AudioNode': parameter 1 is not of type 'AudioNode'");
      }

      destination = args[0][kNapiObj];

      if (args[1] !== undefined) {
        output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: "Failed to execute 'connect' on 'AudioNode':",
        });
      } else {
        output = 0;
      }

      // Rust does not make difference between AudioNode and AudioParam
      input = 0;
    } else {
      throw new TypeError("Failed to execute 'connect' on 'AudioNode': Overload resolution failed");
    }

    try {
      this[kNapiObj].connect(destination, output, input);
    } catch (err) {
      throwSanitizedError(err);
    }

    // return given destination
    return args[0];
  }

  // @todo
  // undefined disconnect ();
  // undefined disconnect (unsigned long output);
  // undefined disconnect (AudioNode destinationNode);
  // undefined disconnect (AudioNode destinationNode, unsigned long output);
  // undefined disconnect (AudioNode destinationNode,
  //                       unsigned long output,
  //                       unsigned long input);
  // undefined disconnect (AudioParam destinationParam);
  // undefined disconnect (AudioParam destinationParam, unsigned long output);

  // disconnect
  // disconnect_dest
  // disconnect_output
  // disconnect_dest_from_output
  // disconnect_dest_from_output_to_input

  disconnect(...args) {
    if (!(this instanceof AudioNode)) {
      throw new TypeError("Invalid Invocation: Value of 'this' must be of type 'AudioNode'");
    }

    if (arguments.length > 2) {
      if (args[0] instanceof AudioNode) {
        const destination = args[0][kNapiObj];
        const output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: "Failed to execute 'disconnect' on 'AudioNode':",
        });
        const input = conversions['unsigned long'](args[2], {
          enforceRange: true,
          context: "Failed to execute 'disconnect' on 'AudioNode':",
        });

        try {
          return this[kNapiObj].disconnect(destination, output, input);
        } catch (err) {
          throwSanitizedError(err);
        }
      } else {
        throw new TypeError("Failed to execute 'disconnect' on 'AudioNode': : Overload resolution failed");
      }
    } else if (arguments.length === 2) {
      if (args[0] instanceof AudioNode || args[0] instanceof AudioParam) {
        const destination = args[0][kNapiObj];
        const output = conversions['unsigned long'](args[1], {
          enforceRange: true,
          context: "Failed to execute 'disconnect' on 'AudioNode':",
        });

        try {
          return this[kNapiObj].disconnect(destination, output);
        } catch (err) {
          throwSanitizedError(err);
        }
      } else {
        throw new TypeError("Failed to execute 'disconnect' on 'AudioNode': : Overload resolution failed");
      }
    } else if (arguments.length === 1) {
      if (args[0] instanceof AudioNode || args[0] instanceof AudioParam) {
        const destination = args[0][kNapiObj];

        try {
          return this[kNapiObj].disconnect(destination);
        } catch (err) {
          throwSanitizedError(err);
        }
      } else if (Number.isFinite(args[0])) {
        const output = conversions['unsigned long'](args[0], {
          enforceRange: true,
          context: "Failed to execute 'disconnect' on 'AudioNode':",
        });

        try {
          return this[kNapiObj].disconnect(output);
        } catch (err) {
          throwSanitizedError(err);
        }
      }

      // Note that we don't have the "overload resolution failed" branch here
      // which seems to be aligned with browsers behavior
    }

    // Just call disconnect for remaning cases
    // - i.e. including node.disconnect(NaN), node.disconnect(null), etc.
    try {
      this[kNapiObj].disconnect();
    } catch (err) {
      throwSanitizedError(err);
    }
  }
}

Object.defineProperties(AudioNode, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioNode.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioNode',
  },
  ${d.attributes(d.node).map(attr => {
    return `${d.name(attr)}: kEnumerableProperty,`;
  }).join('')}
  connect: kEnumerableProperty,
  disconnect: kEnumerableProperty,
});

module.exports = AudioNode;
