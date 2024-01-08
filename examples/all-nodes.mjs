import {
  AnalyserNode,
  AudioBufferSourceNode,
  BiquadFilterNode,
  ChannelMergerNode,
  ChannelSplitterNode,
  ConstantSourceNode,
  ConvolverNode,
  DelayNode,
  DynamicsCompressorNode,
  GainNode,
  IIRFilterNode,
  OscillatorNode,
  PannerNode,
  StereoPannerNode,
  WaveShaperNode,
  // eslint-disable-next-line no-unused-vars
  AudioContext,
  // eslint-disable-next-line no-unused-vars
  OfflineAudioContext,

  mediaDevices,
  MediaStreamAudioSourceNode,
} from '../index.mjs';

// const audioContext = new OfflineAudioContext(1, 1, 48000);
const audioContext = new AudioContext();

console.log('## factory methods');
console.log('');

{
  console.log('audioContext.createAnalyser()');
  audioContext.createAnalyser();
}
{
  console.log('audioContext.createBufferSource()');
  audioContext.createBufferSource();
}
{
  console.log('audioContext.createBiquadFilter()');
  audioContext.createBiquadFilter();
}
{
  console.log('audioContext.createChannelMerger()');
  audioContext.createChannelMerger();
}
{
  console.log('audioContext.createChannelSplitter()');
  audioContext.createChannelSplitter();
}
{
  console.log('audioContext.createConstantSource()');
  audioContext.createConstantSource();
}
{
  console.log('audioContext.createConvolver()');
  audioContext.createConvolver();
}
{
  console.log('audioContext.createDelay()');
  audioContext.createDelay();
}
{
  console.log('audioContext.createDynamicsCompressor()');
  audioContext.createDynamicsCompressor();
}
{
  console.log('audioContext.createGain()');
  audioContext.createGain();
}
{
  console.log('audioContext.createIIRFilter()');
  audioContext.createIIRFilter(new Float64Array([0.1]), new Float64Array([0.1]));
}
{
  console.log('audioContext.createOscillator()');
  audioContext.createOscillator();
}
{
  console.log('audioContext.createPanner()');
  audioContext.createPanner();
}
{
  console.log('audioContext.createStereoPanner()');
  audioContext.createStereoPanner();
}
{
  console.log('audioContext.createWaveShaper()');
  audioContext.createWaveShaper();
}

console.log('');
console.log('## constructors');
console.log('');

{
  console.log('new AnalyserNode(audioContext)');
  new AnalyserNode(audioContext);
}
{
  console.log('new AudioBufferSourceNode(audioContext)');
  new AudioBufferSourceNode(audioContext);
}
{
  console.log('new BiquadFilterNode(audioContext)');
  new BiquadFilterNode(audioContext);
}
{
  console.log('new ChannelMergerNode(audioContext)');
  new ChannelMergerNode(audioContext);
}
{
  console.log('new ChannelSplitterNode(audioContext)');
  new ChannelSplitterNode(audioContext);
}
{
  console.log('new ConstantSourceNode(audioContext)');
  new ConstantSourceNode(audioContext);
}
{
  console.log('new ConvolverNode(audioContext)');
  new ConvolverNode(audioContext);
}
{
  console.log('new DelayNode(audioContext)');
  new DelayNode(audioContext);
}
{
  console.log('new DynamicsCompressorNode(audioContext)');
  new DynamicsCompressorNode(audioContext);
}
{
  console.log('new GainNode(audioContext)');
  new GainNode(audioContext);
}
{
  console.log('new IIRFilterNode(audioContext)');
  new IIRFilterNode(audioContext, {
    feedforward: new Float64Array([0.1]),
    feedback: new Float64Array([0.1]),
  });
}
{
  console.log('new OscillatorNode(audioContext)');
  new OscillatorNode(audioContext);
}
{
  console.log('new PannerNode(audioContext)');
  new PannerNode(audioContext);
}
{
  console.log('new StereoPannerNode(audioContext)');
  new StereoPannerNode(audioContext);
}
{
  console.log('new WaveShaperNode(audioContext)');
  new WaveShaperNode(audioContext);
}

if (audioContext instanceof AudioContext) {
  console.log('');
  console.log('## AudioContext only');
  console.log('');

  const mediaStream = await mediaDevices.getUserMedia({ audio: true });

  {
    console.log('audioContext.createMediaStreamSource(mediaStream)');
    audioContext.createMediaStreamSource(mediaStream);
  }

  {
    console.log('new MediaStreamAudioSourceNode(audioContext, { mediaStream })');
    new MediaStreamAudioSourceNode(audioContext, { mediaStream });
  }

  console.log('');
  audioContext.close();
}
