exports.isPlainObject = function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

exports.isPositiveInt = function isPositiveInt(n) {
  return Number.isSafeInteger(n) && 0 < n;
};

exports.isPositiveNumber = function isPositiveNumber(n) {
  return Number(n) === n && 0 < n;
};

exports.isFunction = function isFunction(val) {
  return Object.prototype.toString.call(val) == '[object Function]' ||
    Object.prototype.toString.call(val) == '[object AsyncFunction]';
}
