import { assert } from 'chai';
import { delay } from '@ircam/sc-utils';
import { mediaDevices } from '../index.js';

describe('# mediaDevices', () => {
  it('enumerateDevices should be async', async () => {
    let counter = 0;
    let resolved = false;

    mediaDevices.enumerateDevices().then((values) => {
      resolved = true;
      console.log(values);
      assert.equal(counter, 1);
    });

    assert.equal(counter, 0);
    counter += 1;

    await delay(100);
    assert(resolved, true);
  });

  it('getUserMedia should be async', async () => {
    let counter = 0;
    let resolved = false;

    mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      resolved = true;
      console.log(stream);
      assert.equal(counter, 1);
    });

    assert.equal(counter, 0);
    counter += 1;

    await delay(100);
    assert(resolved, true);
  });
});
