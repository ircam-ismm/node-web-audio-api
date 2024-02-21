const { EOL } = require('os');
const path = require('path');

const internalPath = path.join('node-web-audio-api', 'js');
const internalRe = new RegExp(internalPath);

// from wpt/resources/tesharness.js (line 2226)
const nameCodeMap = {
    IndexSizeError: 1,
    HierarchyRequestError: 3,
    WrongDocumentError: 4,
    InvalidCharacterError: 5,
    NoModificationAllowedError: 7,
    NotFoundError: 8,
    NotSupportedError: 9,
    InUseAttributeError: 10,
    InvalidStateError: 11,
    SyntaxError: 12,
    InvalidModificationError: 13,
    NamespaceError: 14,
    InvalidAccessError: 15,
    TypeMismatchError: 17,
    SecurityError: 18,
    NetworkError: 19,
    AbortError: 20,
    URLMismatchError: 21,
    QuotaExceededError: 22,
    TimeoutError: 23,
    InvalidNodeTypeError: 24,
    DataCloneError: 25,

    EncodingError: 0,
    NotReadableError: 0,
    UnknownError: 0,
    ConstraintError: 0,
    DataError: 0,
    TransactionInactiveError: 0,
    ReadOnlyError: 0,
    VersionError: 0,
    OperationError: 0,
    NotAllowedError: 0,
    OptOutError: 0
};


class DOMException extends Error {
  constructor(message, name) {
    super(message);

    this.name = name;
    this.code = nameCodeMap[this.name];
  }
}

exports.DOMException = DOMException;

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
  } if (originalMessage.startsWith('IndexSizeError')) {
    const msg = originalMessage.replace(/^IndexSizeError - /, '');
    const error = new DOMException(msg, 'IndexSizeError');
    overrideStack(err, error);

    throw error;
  } if (originalMessage.startsWith('InvalidAccessError')) {
    const msg = originalMessage.replace(/^InvalidAccessError - /, '');
    const error = new DOMException(msg, 'InvalidAccessError');
    overrideStack(err, error);

    throw error;
  }

  console.warn('[lib/errors.js] Possibly unhandled error type', err.message);
  throw err;
}
