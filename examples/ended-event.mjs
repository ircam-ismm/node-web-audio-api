import fs from 'node:fs';
import path from 'node:path';
import { AudioContext, AudioBufferSourceNode, OscillatorNode, ConstantSourceNode } from '../index.mjs';


// test that if the context is closed before ended event is trigerred,
// the underlying tsfn is properly aborted
const TEST_ABORT_EARLY = false;
// test factory methods or node constructors
const USE_FACTORY_METHODS = true;


const latencyHint = process.env.WEB_AUDIO_LATENCY === 'playback' ? 'playback' : 'interactive';
const audioContext = new AudioContext({ latencyHint });

const buffer = fs.readFileSync(path.join('examples', 'samples', 'sample.wav')).buffer;
const audioBuffer = await audioContext.decodeAudioData(buffer);

{
  const src = USE_FACTORY_METHODS
    ? audioContext.createBufferSource()
    : new AudioBufferSourceNode(audioContext);

  src.buffer = audioBuffer;
  src.connect(audioContext.destination);
  // src.buffer = audioBuffer;
  src.addEventListener('ended', (e) => {
    console.log('> AudioBufferSourceNode::onended', e);
  });

  src.start();
}

if (TEST_ABORT_EARLY) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('> closing context');
  await audioContext.close();
} else {
  await new Promise(resolve => setTimeout(resolve, 5 * 1000));

  {
    const src = USE_FACTORY_METHODS
      ? audioContext.createOscillator()
      : new OscillatorNode(audioContext);

    src.frequency.value = 200;
    src.connect(audioContext.destination);
    // src.buffer = audioBuffer;
    src.addEventListener('ended', (e) => {
      console.log('> OscillatorNode::onended', e);
    });

    const now = audioContext.currentTime
    src.start(now);
    src.stop(now + 1);
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  {
    const src = USE_FACTORY_METHODS
      ? audioContext.createConstantSource()
      : new ConstantSourceNode(audioContext);

    src.offset.value = 0.1;
    src.connect(audioContext.destination);
    // src.buffer = audioBuffer;
    src.addEventListener('ended', (e) => {
      console.log('> ConstantSourceNode::onended', e);
    });

    const now = audioContext.currentTime
    src.start(now);
    src.stop(now + 1);
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('> closing context');
  await audioContext.close();
}

