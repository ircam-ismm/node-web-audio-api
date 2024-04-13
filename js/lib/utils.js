exports.isFunction = function isFunction(val) {
  return Object.prototype.toString.call(val) == '[object Function]' ||
    Object.prototype.toString.call(val) == '[object AsyncFunction]';
};

const kEnumerableProperty = { __proto__: null };
kEnumerableProperty.enumerable = true;
Object.freeze(kEnumerableProperty);

exports.kEnumerableProperty = kEnumerableProperty;
