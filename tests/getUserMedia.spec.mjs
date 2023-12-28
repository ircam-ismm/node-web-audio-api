import { assert } from 'chai';

import { mediaDevices } from '../index.mjs';

describe('# mediaDevices.getUserMedia(options)', () => {
  it('should fail if no argument given', async () => {
    let failed = false;
    try {
      await mediaDevices.getUserMedia();
    } catch (err) {
      console.log(err.message);
      failed = true;
    }

    if (!failed) { assert.fail(); }
  });

  // @todo - clean error message
  it('should fail if argument is not an object', async () => {
    let failed = false;
    try {
      await mediaDevices.getUserMedia(true);
    } catch (err) {
      console.log(err.message);
      failed = true;
    }

    if (!failed) { assert.fail(); }
  });

  it('should fail if options.video', async () => {
    let failed = false;
    try {
      await mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.log(err.message);
      failed = true;
    }

    if (!failed) { assert.fail(); }
  });

  it('should not fail if options.audio = true', async () => {
    let failed = false;

    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
      // console.log(stream instanceof mediaDevices.MediaStream);
    } catch (err) {
      console.log(err);
      failed = true;
    }

    console.log(failed);

    if (failed) { assert.fail('should not have failed'); }
  });
});
