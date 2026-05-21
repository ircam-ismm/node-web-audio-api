import { assert } from 'chai';
import { toSanitizedSequence } from '../js/lib/cast.js'

describe('toSanitizedSequence - Float32Array', () => {
  const target = Float32Array;
  it('should work with Float32', () => {
    const data = new Float32Array([0., 1]);
    const result = toSanitizedSequence(data, target);
    const expected = new target([0., 1]);

    assert.deepEqual(result, expected);
  });

  it('should work with Float64', () => {
    const data = new Float64Array([0., 1]);
    const result = toSanitizedSequence(data, target);
    const expected = new target([0., 1]);

    assert.deepEqual(result, expected);
  });

  it('should work with Arrays', () => {
    const data = [0, 1];
    const result = toSanitizedSequence(data, target);
    const expected = new target([0., 1]);

    assert.deepEqual(result, expected);
  });

  it('should throw if item is non finite', () => {
    const data = [0., NaN];

    assert.throws(() => {
      toSanitizedSequence(data, target)
    });
  });
});
