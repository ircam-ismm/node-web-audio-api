// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

const conversions = require('webidl-conversions');

const {
  toSanitizedSequence,
} = require('./lib/cast.js');
const {
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');

class AudioParam {
  constructor(options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object') ||
      !(kNapiObj in options) ||
      options[kNapiObj]['Symbol.toStringTag'] !== 'AudioParam'
    ) {
      throw new TypeError('Illegal constructor');
    }

    this[kNapiObj] = options[kNapiObj];
  }

  get value() {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    return this[kNapiObj].value;
  }

  set value(value) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    value = conversions['float'](value, {
      context: `Failed to set the 'value' property on 'AudioParam': The provided float value`,
    });

    try {
      this[kNapiObj].value = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  get automationRate() {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    return this[kNapiObj].automationRate;
  }

  set automationRate(value) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (!['a-rate', 'k-rate'].includes(value)) {
      console.warn(`Failed to set the 'automationRate' property on 'AudioParam': Value '${value}' is not a valid 'AutomationRate' enum value`);
      return;
    }

    try {
      this[kNapiObj].automationRate = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  get defaultValue() {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    return this[kNapiObj].defaultValue;
  }

  get minValue() {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    return this[kNapiObj].minValue;
  }

  get maxValue() {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    return this[kNapiObj].maxValue;
  }

  setValueAtTime(value, startTime) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (arguments.length < 2) {
      throw new TypeError(`Failed to execute 'setValueAtTime' on 'AudioParam': 2 argument required, but only ${arguments.length} present`);
    }

    value = conversions['float'](value, {
      context: `Failed to execute 'setValueAtTime' on 'AudioParam': Parameter 1`,
    });

    startTime = conversions['double'](startTime, {
      context: `Failed to execute 'setValueAtTime' on 'AudioParam': Parameter 2`,
    });

    try {
      this[kNapiObj].setValueAtTime(value, startTime);
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (arguments.length < 2) {
      throw new TypeError(`Failed to execute 'linearRampToValueAtTime' on 'AudioParam': 2 argument required, but only ${arguments.length} present`);
    }

    value = conversions['float'](value, {
      context: `Failed to execute 'linearRampToValueAtTime' on 'AudioParam': Parameter 1`,
    });

    endTime = conversions['double'](endTime, {
      context: `Failed to execute 'linearRampToValueAtTime' on 'AudioParam': Parameter 2`,
    });

    try {
      this[kNapiObj].linearRampToValueAtTime(value, endTime);
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (arguments.length < 2) {
      throw new TypeError(`Failed to execute 'exponentialRampToValueAtTime' on 'AudioParam': 2 argument required, but only ${arguments.length} present`);
    }

    value = conversions['float'](value, {
      context: `Failed to execute 'exponentialRampToValueAtTime' on 'AudioParam': Parameter 1`,
    });

    endTime = conversions['double'](endTime, {
      context: `Failed to execute 'exponentialRampToValueAtTime' on 'AudioParam': Parameter 2`,
    });

    try {
      this[kNapiObj].exponentialRampToValueAtTime(value, endTime);
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }

  setTargetAtTime(target, startTime, timeConstant) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (arguments.length < 3) {
      throw new TypeError(`Failed to execute 'setTargetAtTime' on 'AudioParam': 3 argument required, but only ${arguments.length} present`);
    }

    target = conversions['float'](target, {
      context: `Failed to execute 'setTargetAtTime' on 'AudioParam': Parameter 1`,
    });

    startTime = conversions['double'](startTime, {
      context: `Failed to execute 'setTargetAtTime' on 'AudioParam': Parameter 2`,
    });

    timeConstant = conversions['float'](timeConstant, {
      context: `Failed to execute 'setTargetAtTime' on 'AudioParam': Parameter 3`,
    });

    try {
      this[kNapiObj].setTargetAtTime(target, startTime, timeConstant);
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }

  setValueCurveAtTime(values, startTime, duration) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (arguments.length < 3) {
      throw new TypeError(`Failed to execute 'setValueCurveAtTime' on 'AudioParam': 3 argument required, but only ${arguments.length} present`);
    }

    try {
      values = toSanitizedSequence(values, Float32Array);
    } catch (err) {
      throw new TypeError(`Failed to execute 'setValueCurveAtTime': Parameter 1 ${err.message}`);
    }

    startTime = conversions['double'](startTime, {
      context: `Failed to execute 'setValueCurveAtTime' on 'AudioParam': Parameter 2`,
    });

    duration = conversions['double'](duration, {
      context: `Failed to execute 'setValueCurveAtTime' on 'AudioParam': Parameter 3`,
    });

    try {
      this[kNapiObj].setValueCurveAtTime(values, startTime, duration);
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }

  cancelScheduledValues(cancelTime) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (arguments.length < 1) {
      throw new TypeError(`Failed to execute 'cancelScheduledValues' on 'AudioParam': 1 argument required, but only ${arguments.length} present`);
    }

    cancelTime = conversions['double'](cancelTime, {
      context: `Failed to execute 'cancelScheduledValues' on 'AudioParam': Parameter 1`,
    });

    try {
      this[kNapiObj].cancelScheduledValues(cancelTime);
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }

  cancelAndHoldAtTime(cancelTime) {
    if (!(this instanceof AudioParam)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioParam\'');
    }

    if (arguments.length < 1) {
      throw new TypeError(`Failed to execute 'cancelAndHoldAtTime' on 'AudioParam': 1 argument required, but only ${arguments.length} present`);
    }

    cancelTime = conversions['double'](cancelTime, {
      context: `Failed to execute 'cancelAndHoldAtTime' on 'AudioParam': Parameter 1`,
    });

    try {
      this[kNapiObj].cancelAndHoldAtTime(cancelTime);
    } catch (err) {
      throwSanitizedError(err);
    }

    return this;
  }

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
  value: kEnumerableProperty,
  automationRate: kEnumerableProperty,
  defaultValue: kEnumerableProperty,
  minValue: kEnumerableProperty,
  maxValue: kEnumerableProperty,
  setValueAtTime: kEnumerableProperty,
  linearRampToValueAtTime: kEnumerableProperty,
  exponentialRampToValueAtTime: kEnumerableProperty,
  setTargetAtTime: kEnumerableProperty,
  setValueCurveAtTime: kEnumerableProperty,
  cancelScheduledValues: kEnumerableProperty,
  cancelAndHoldAtTime: kEnumerableProperty,
});

module.exports = AudioParam;
