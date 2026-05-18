const { EOL } = require('os');
const path = require('path');

const internalPath = path.join('node-web-audio-api', 'js');
const internalRe = new RegExp(internalPath);

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
  originalMessage = originalMessage.replace('assertion `left == right` failed: ', '');
  originalMessage = originalMessage.split(EOL)[0]; // keep only first line

  // "Native Errors"
  if (originalMessage.startsWith('TypeError')) {
    const msg = originalMessage.replace(/^TypeError - /, '');
    const error = new TypeError(msg);
    overrideStack(err, error);

    throw error;
  } else if (originalMessage.startsWith('RangeError')) {
    const msg = originalMessage.replace(/^RangeError - /, '');
    const error = new RangeError(msg);
    overrideStack(err, error);

    throw error;
  }

  // DOM Exceptions
  if (originalMessage.startsWith('NotSupportedError')) {
    const msg = originalMessage.replace(/^NotSupportedError - /, '');
    const error = new DOMException(msg, 'NotSupportedError');
    overrideStack(err, error);

    throw error;
  } else  if (originalMessage.startsWith('InvalidStateError')) {
    const msg = originalMessage.replace(/^InvalidStateError - /, '');
    const error = new DOMException(msg, 'InvalidStateError');
    overrideStack(err, error);

    throw error;
  } else if (originalMessage.startsWith('IndexSizeError')) {
    const msg = originalMessage.replace(/^IndexSizeError - /, '');
    const error = new DOMException(msg, 'IndexSizeError');
    overrideStack(err, error);

    throw error;
  } else if (originalMessage.startsWith('InvalidAccessError')) {
    const msg = originalMessage.replace(/^InvalidAccessError - /, '');
    const error = new DOMException(msg, 'InvalidAccessError');
    overrideStack(err, error);

    throw error;
  } else if (originalMessage.startsWith('NotFoundError')) {
    const msg = originalMessage.replace(/^NotFoundError - /, '');
    const error = new DOMException(msg, 'NotFoundError');
    overrideStack(err, error);

    throw error;

  // @todo - This handle panics that occur in rust async methods where somehow
  // the error message is swallowed by napi which return a generic message
  // cf. https://github.com/napi-rs/napi-rs/pull/2050/changes
  // This is not satisfying as we loose explanations and should be improved if possible
  } else if (originalMessage.includes('Panic in async function')) {
    const msg = 'Error in async function';
    const error = new DOMException(msg, 'InvalidStateError');
    // the napi original error have no stack neither, so just throw the new one
    // it gives some information at least
    throw error;
  }

  console.warn('[lib/errors.js] Unexpected Rust error', err);
  throw err;
}
