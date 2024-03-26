const conversions = require("webidl-conversions");
const { throwSanitizedError } = require('./lib/errors.js');

const { kNapiObj } = require('./lib/symbols.js');
const { AudioParam } = require('./AudioParam.js');

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
  constructor(napiObj) {
    // Make constructor "private"
    // @todo - this is not very solid, but does the job for now
    if (napiObj['Symbol.toStringTag'] !== 'AudioListener') {
      throw new TypeError('Illegal constructor');
    }

    this[kNapiObj] = napiObj;

    const positionX = new AudioParam(napiObj.positionX)
    Object.defineProperty(this, 'positionX', {
       value: positionX,
       writable: false,
    });

    const positionY = new AudioParam(napiObj.positionY)
    Object.defineProperty(this, 'positionY', {
       value: positionY,
       writable: false,
    });

    const positionZ = new AudioParam(napiObj.positionZ)
    Object.defineProperty(this, 'positionZ', {
       value: positionZ,
       writable: false,
    });

    const forwardX = new AudioParam(napiObj.forwardX)
    Object.defineProperty(this, 'forwardX', {
       value: forwardX,
       writable: false,
    });

    const forwardY = new AudioParam(napiObj.forwardY)
    Object.defineProperty(this, 'forwardY', {
       value: forwardY,
       writable: false,
    });

    const forwardZ = new AudioParam(napiObj.forwardZ)
    Object.defineProperty(this, 'forwardZ', {
       value: forwardZ,
       writable: false,
    });

    const upX = new AudioParam(napiObj.upX)
    Object.defineProperty(this, 'upX', {
       value: upX,
       writable: false,
    });

    const upY = new AudioParam(napiObj.upY)
    Object.defineProperty(this, 'upY', {
       value: upY,
       writable: false,
    });

    const upZ = new AudioParam(napiObj.upZ)
    Object.defineProperty(this, 'upZ', {
       value: upZ,
       writable: false,
    });
  }

  setPosition(x, y, z) {
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

module.exports = AudioListener;
