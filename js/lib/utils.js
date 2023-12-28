exports.isPlainObject = function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

exports.isPositiveInt = function isPositiveInt(n) {
  return Number.isSafeInteger(n) && 0 < n;
};

exports.isPositiveNumber = function isPositiveNumber(n) {
  return Number(n) === n && 0 < n;
};
