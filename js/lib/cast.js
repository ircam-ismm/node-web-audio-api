
exports.toSanitizedSequence = function toSanitizedSequence(data, targetCtor) {
  if (
    (data.buffer && data.buffer instanceof ArrayBuffer)
    || Array.isArray(data)
  ) {
    data = new targetCtor(data);
  } else {
    throw new TypeError(`cannot be converted to sequence of ${targetCtor}`);
  }

  // check it only contains finite values
  for (let i = 0; i < data.length; i++) {
    if (!Number.isFinite(data[i])) {
      throw new TypeError(`should contain only finite values`);
    }
  }

  return data;
}
