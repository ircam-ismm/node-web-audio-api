import { assert } from 'chai';
import { sleep } from '@ircam/sc-utils';

import { mediaDevices, AudioContext, MediaStreamAudioSourceNode } from '../index.mjs';

describe('# mediaDevices.getUserMedia(options)', () => {
  it('should fail if no argument given', async () => {
    let failed = false;
    try {
      await mediaDevices.getUserMedia();
    } catch (err) {
      console.log(err.message);
      failed = true;
    }

    if (!failed) {
      assert.fail('should have failed');
    }
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

    if (!failed) {
      assert.fail('should have failed');
    }
  });

  it('should fail if options.video', async () => {
    let failed = false;
    try {
      await mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.log(err.message);
      failed = true;
    }

    if (!failed) {
      assert.fail('should have failed');
    }
  });

  it('should not fail if options.audio = true', async () => {
    let failed = false;
    const audioContext = new AudioContext();

    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.log(err);
      failed = true;
    }

    await sleep(0.4);
    await audioContext.close();

    if (failed) {
      assert.fail('should not have failed');
    }
  });

  it('should work with MediaStreamAudioSourceNode [1 factory] (make some noise)', async () => {
    let failed = false;
    const audioContext = new AudioContext();

    const stream = await mediaDevices.getUserMedia({ audio: true });

    try {
      const src = audioContext.createMediaStreamSource(stream);
      src.connect(audioContext.destination);
    } catch (err) {
      console.log(err);
      failed = true;
    }

    await sleep(0.4);
    await audioContext.close();

    if (failed) {
      assert.fail('should not have failed');
    }
  });

  it('should work with MediaStreamAudioSourceNode [2 ctor] (make some noise)', async () => {
    let failed = false;
    const audioContext = new AudioContext();

    const stream = await mediaDevices.getUserMedia({ audio: true });

    try {
      const src = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
      src.connect(audioContext.destination);
    } catch (err) {
      console.log(err);
      failed = true;
    }

    await sleep(0.4);
    await audioContext.close();

    if (failed) {
      assert.fail('should not have failed');
    }
  });
});
