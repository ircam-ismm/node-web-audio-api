
exports.toSanitizedSequence = function toSanitizedSequence(data, targetCtor) {
  console.warn('toSanitizedSequence: this change the instance, maybe not the right way to do')
  if (
    (data.buffer && data.buffer instanceof ArrayBuffer)
    || Array.isArray(data)
  ) {
    data = new targetCtor(data);
  } else {
    throw new TypeError(`Failed to execute 'copyFromChannel' on 'AudioBuffer': parameter 1 is not of type 'Float32Array'`);
  }

  for (let i = 0; i < data.length; i++) {
    if (!Number.isFinite(data[i])) {
      throw Error(`which one?`);
    }
  }

  return data;
}
