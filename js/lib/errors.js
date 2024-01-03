const { EOL } = require('os');

exports.NotSupportedError = class NotSupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotSupportedError';
  }
}

exports.InvalidStateError = class InvalidStateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RangeError';
  }
}

function overrideStack(originalError, newError) {
  const lines = originalError.stack.split(EOL);
  // override previous error message
  lines[0] = newError.message;
  // remove first stack line which correspond to the try / catch in Object
  lines.splice(1, 1);
  // override new stack with modified one
  newError.stack = lines.join(EOL);
}

exports.throwSanitizedError = function throwSanitizedError(err) {
  // "Native Errors"
  if (err.message.startsWith('TypeError')) {
    console.log('here?')
    const msg = err.message.replace(/^TypeError - /, '');
    const error = new TypeError(msg);
    overrideStack(err, error);

    throw error;
  } else if (err.message.startsWith('RangeError')) {
    const msg = err.message.replace(/^RangeError - /, '');
    const error = new RangeError(msg);
    overrideStack(err, error);

    throw error;
  }

  // "other errors"
  if (err.message.startsWith('NotSupportedError')) {
    const msg = err.message.replace(/^NotSupportedError - /, '');
    const error = new NotSupportedError(msg);
    overrideStack(err, error);

    throw error;
  } else  if (err.message.startsWith('InvalidStateError')) {
    const msg = err.message.replace(/^InvalidStateError - /, '');
    const error = new InvalidStateError(msg);
    overrideStack(err, error);

    throw error;
  } // etc...

  console.warn('[lib/errors.js] Unhandled error type', err.name, err.message);
  throw err;
}
