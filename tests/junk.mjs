import { AudioBuffer, AudioBufferSourceNode, AnalyserNode, AudioContext, AudioListener, ChannelMergerNode, ChannelSplitterNode, ConstantSourceNode, ConvolverNode, DelayNode, GainNode, IIRFilterNode, OfflineAudioContext, OscillatorNode, PannerNode, StereoPannerNode, PeriodicWave, MediaStreamAudioSourceNode, WaveShaperNode, mediaDevices } from '../index.mjs';

const RENDER_QUANTUM_FRAMES = 128;

// const audioContext = new AudioContext();
// console.log(audioContext.listener);

async function testListenerParams(should, options) {
  // Arbitrary sample rate and duration.
  const sampleRate = 8000;
  const testFrames = 5 * RENDER_QUANTUM_FRAMES;
  let testDuration = testFrames / sampleRate;
  // Four channels needed because the first two are for the output of
  // the reference panner, and the next two are for the test panner.
  let context = new OfflineAudioContext({
    numberOfChannels: 2,
    sampleRate: sampleRate,
    length: testDuration * sampleRate
  });

  console.log('coucou', context.listener instanceof AudioListener);

  // Create a stereo source out of two mono sources
  let src0 = new ConstantSourceNode(context, {offset: 1});
  let src1 = new ConstantSourceNode(context, {offset: 2});
  let src = new ChannelMergerNode(context, {numberOfInputs: 2});
  src0.connect(src, 0, 0);
  src1.connect(src, 0, 1);

  let finalPosition = 100;

  // Reference panner node with k-rate AudioParam automations.  The
  // output of this panner is the reference output.
  let panner = new PannerNode(context);
  panner.positionX.value = 10;
  panner.positionY.value = 50;
  panner.positionZ.value = -25;

  src.connect(panner);

  let mod = new ConstantSourceNode(context, {offset: 0});
  mod.offset.setValueAtTime(1, 0);
  mod.offset.linearRampToValueAtTime(finalPosition, testDuration);

  context.listener[options.param].automationRate = 'k-rate';
  // console.log(context.listener);
  console.log(context.listener[options.param]);
  mod.connect(context.listener[options.param]);

  panner.connect(context.destination);

  src0.start();
  src1.start();
  mod.start();

  const buffer = await context.startRendering();
  let c0 = buffer.getChannelData(0);
  let c1 = buffer.getChannelData(1);

  // Verify output is a stair step because positionX is k-rate,
  // and no other AudioParam is changing.

  for (let k = 0; k < testFrames; k += RENDER_QUANTUM_FRAMES) {
    should(
        c0.slice(k, k + RENDER_QUANTUM_FRAMES),
        `Listener: ${options.param}: Channel 0 output[${k}, ${
            k + RENDER_QUANTUM_FRAMES - 1}]`)
        .beConstantValueOf(c0[k]);
  }

  for (let k = 0; k < testFrames; k += RENDER_QUANTUM_FRAMES) {
    should(
        c1.slice(k, k + RENDER_QUANTUM_FRAMES),
        `Listener: ${options.param}: Channel 1 output[${k}, ${
            k + RENDER_QUANTUM_FRAMES - 1}]`)
        .beConstantValueOf(c1[k]);
  }
}

testListenerParams((a) => console.log(a), {param: 'positionX'});
