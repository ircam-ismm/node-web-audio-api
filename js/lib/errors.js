const { EOL } = require('os');
const path = require('path');

const internalPath = path.join('node-web-audio-api', 'js');
const internalRe = new RegExp(internalPath);

class NotSupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotSupportedError';
  }
}

class InvalidStateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidStateError';
  }
}

class IndexSizeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IndexSizeError';
  }
}

class InvalidAccessError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidAccessError';
  }
}

exports.NotSupportedError = NotSupportedError;
exports.InvalidStateError = InvalidStateError;
exports.IndexSizeError = IndexSizeError;

function overrideStack(originalError, newError) {
  // override previous error message
  const stack = originalError.stack.replace(originalError.message, newError.message);
  const lines = stack.split(EOL);

  // remove all lines that refer to internal classes, i.e. contains `node-web-audio-api/js`
  for (let i = lines.length - 1; i > 0; i--) {
    const line = lines[i];
    if (internalRe.test(line)) {
      lines.splice(i, 1);
    }
  }

  // override new stack with modified one
  newError.stack = lines.join(EOL);
}

exports.throwSanitizedError = function throwSanitizedError(err) {
  // We also need to handle output of `assert_ne!` as well, e.g.
  // assertion `left != right` failed: NotSupportedError - StereoPannerNode channel count mode cannot be set to max
  //   left: Max
  //   right: Max
  let originalMessage = err.message;
  originalMessage = originalMessage.replace('assertion `left != right` failed: ', '');
  originalMessage = originalMessage.split(EOL)[0]; // keep only first line

  // "Native Errors"
  if (originalMessage.startsWith('TypeError')) {
    const msg = originalMessage.replace(/^TypeError - /, '');
    const error = new TypeError(msg);

    throw error;
  } else if (originalMessage.startsWith('RangeError')) {
    const msg = originalMessage.replace(/^RangeError - /, '');
    const error = new RangeError(msg);
    overrideStack(err, error);

    throw error;
  }

  // "other errors"
  if (originalMessage.startsWith('NotSupportedError')) {
    const msg = originalMessage.replace(/^NotSupportedError - /, '');
    const error = new NotSupportedError(msg);
    overrideStack(err, error);

    throw error;
  } else  if (originalMessage.startsWith('InvalidStateError')) {
    const msg = originalMessage.replace(/^InvalidStateError - /, '');
    const error = new InvalidStateError(msg);
    overrideStack(err, error);

    throw error;
  } if (originalMessage.startsWith('IndexSizeError')) {
    const msg = originalMessage.replace(/^IndexSizeError - /, '');
    const error = new IndexSizeError(msg);
    overrideStack(err, error);

    throw error;
  } if (originalMessage.startsWith('InvalidAccessError')) {
    const msg = originalMessage.replace(/^InvalidAccessError - /, '');
    const error = new InvalidAccessError(msg);
    overrideStack(err, error);

    throw error;
  }

  console.warn('[lib/errors.js] Unhandled error type', err.name, err.message);
  throw err;
}
