export function isFunction(val) {
  return Object.prototype.toString.call(val) == '[object Function]' ||
    Object.prototype.toString.call(val) == '[object AsyncFunction]';
};

export const kEnumerableProperty = { __proto__: null };
kEnumerableProperty.enumerable = true;
Object.freeze(kEnumerableProperty);

export const kHiddenProperty = { __proto__: null };
kHiddenProperty.enumerable = false;
Object.freeze(kHiddenProperty);
