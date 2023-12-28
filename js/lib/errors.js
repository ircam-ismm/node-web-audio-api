class NotSupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotSupportedError';
  }
}

exports.NotSupportedError = NotSupportedError;
