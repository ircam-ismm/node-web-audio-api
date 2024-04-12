const conversions = require("webidl-conversions");

const { throwSanitizedError } = require('./lib/errors.js');
const { kEnumerableProperty } = require('./lib/utils.js');
const { kNapiObj } = require('./lib/symbols.js');

const AudioParam = require('./AudioParam.js');

// interface AudioListener {
//     readonly attribute AudioParam positionX;
//     readonly attribute AudioParam positionY;
//     readonly attribute AudioParam positionZ;
//     readonly attribute AudioParam forwardX;
//     readonly attribute AudioParam forwardY;
//     readonly attribute AudioParam forwardZ;
//     readonly attribute AudioParam upX;
//     readonly attribute AudioParam upY;
//     readonly attribute AudioParam upZ;
//     undefined setPosition (float x, float y, float z);
//     undefined setOrientation (float x, float y, float z, float xUp, float yUp, float zUp);
// };
class AudioListener {
  #positionX = null;
  #positionY = null;
  #positionZ = null;
  #forwardX = null;
  #forwardY = null;
  #forwardZ = null;
  #upX = null;
  #upY = null;
  #upZ = null;

  constructor(options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object')
      || !(kNapiObj in options)
      || options[kNapiObj]['Symbol.toStringTag'] !== 'AudioListener'
    ) {
      throw new TypeError('Illegal constructor');
    }

    this[kNapiObj] = options[kNapiObj];

    this.#positionX = new AudioParam({ [kNapiObj]: this[kNapiObj].positionX });
    this.#positionY = new AudioParam({ [kNapiObj]: this[kNapiObj].positionY });
    this.#positionZ = new AudioParam({ [kNapiObj]: this[kNapiObj].positionZ });
    this.#forwardX = new AudioParam({ [kNapiObj]: this[kNapiObj].forwardX });
    this.#forwardY = new AudioParam({ [kNapiObj]: this[kNapiObj].forwardY });
    this.#forwardZ = new AudioParam({ [kNapiObj]: this[kNapiObj].forwardZ });
    this.#upX = new AudioParam({ [kNapiObj]: this[kNapiObj].upX });
    this.#upY = new AudioParam({ [kNapiObj]: this[kNapiObj].upY });
    this.#upZ = new AudioParam({ [kNapiObj]: this[kNapiObj].upZ });
  }

  get positionX() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#positionX;
  }

  get positionY() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#positionY;
  }

  get positionZ() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#positionZ;
  }

  get forwardX() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#forwardX;
  }

  get forwardY() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#forwardY;
  }

  get forwardZ() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#forwardZ;
  }

  get upX() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#upX;
  }

  get upY() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#upY;
  }

  get upZ() {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    return this.#upZ;
  }

  setPosition(x, y, z) {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    if (arguments.length < 3) {
      throw new TypeError(`Failed to execute 'setPosition' on 'AudioListener': 3 arguments required, but only 0 present.`);
    }

    x = conversions['float'](x, {
      context: `Failed to execute 'setPosition' on 'AudioListener': The provided float value`,
    });

    y = conversions['float'](y, {
      context: `Failed to execute 'setPosition' on 'AudioListener': The provided float value`,
    });

    z = conversions['float'](z, {
      context: `Failed to execute 'setPosition' on 'AudioListener': The provided float value`,
    });

    try {
      this[kNapiObj].setPosition(x, y, z);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  setOrientation(x, y, z, xUp, yUp, zUp) {
    if (!(this instanceof AudioListener)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'AudioListener\'');
    }

    if (arguments.length < 6) {
      throw new TypeError(`Failed to execute 'setOrientation' on 'AudioListener': 6 arguments required, but only 0 present.`);
    }

    x = conversions['float'](x, {
      context: `Failed to execute 'setOrientation' on 'AudioListener': The provided float value`,
    });

    y = conversions['float'](y, {
      context: `Failed to execute 'setOrientation' on 'AudioListener': The provided float value`,
    });

    Z = conversions['float'](Z, {
      context: `Failed to execute 'setOrientation' on 'AudioListener': The provided float value`,
    });

    xUp = conversions['float'](xUp, {
      context: `Failed to execute 'setOrientation' on 'AudioListener': The provided float value`,
    });

    yUp = conversions['float'](yUp, {
      context: `Failed to execute 'setOrientation' on 'AudioListener': The provided float value`,
    });

    zUp = conversions['float'](zUp, {
      context: `Failed to execute 'setOrientation' on 'AudioListener': The provided float value`,
    });

    try {
      this[kNapiObj].setOrientation(x, y, z, xUp, yUp, zUp);
    } catch (err) {
      throwSanitizedError(err);
    }
  }
}

Object.defineProperties(AudioListener, {
  length: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 0,
  },
});

Object.defineProperties(AudioListener.prototype, {
  [Symbol.toStringTag]: {
    __proto__: null,
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'AudioListener',
  },

  positionX: kEnumerableProperty,
  positionY: kEnumerableProperty,
  positionZ: kEnumerableProperty,
  forwardX: kEnumerableProperty,
  forwardY: kEnumerableProperty,
  forwardZ: kEnumerableProperty,
  upX: kEnumerableProperty,
  upY: kEnumerableProperty,
  upZ: kEnumerableProperty,
  setPosition: kEnumerableProperty,
  setOrientation: kEnumerableProperty,
});

module.exports = AudioListener;
