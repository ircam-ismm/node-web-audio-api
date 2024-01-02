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
  AudioContext,
  OfflineAudioContext,
} from '../index.mjs';

const audioContext = new OfflineAudioContext(1, 1, 48000);
// const audioContext = new AudioContext();

console.log('## factory methods');
console.log('');

{
  console.log('audioContext.createAnalyser()');
  const node = audioContext.createAnalyser();
}
{
  console.log('audioContext.createBufferSource()');
  const node = audioContext.createBufferSource();
}
{
  console.log('audioContext.createBiquadFilter()');
  const node = audioContext.createBiquadFilter();
}
{
  console.log('audioContext.createChannelMerger()');
  const node = audioContext.createChannelMerger();
}
{
  console.log('audioContext.createChannelSplitter()');
  const node = audioContext.createChannelSplitter();
}
{
  console.log('audioContext.createConstantSource()');
  const node = audioContext.createConstantSource();
}
{
  console.log('audioContext.createConvolver()');
  const node = audioContext.createConvolver();
}
{
  console.log('audioContext.createDelay()');
  const node = audioContext.createDelay();
}
{
  console.log('audioContext.createDynamicsCompressor()');
  const node = audioContext.createDynamicsCompressor();
}
{
  console.log('audioContext.createGain()');
  const node = audioContext.createGain();
}
{
  console.log('audioContext.createIIRFilter()');
  const node = audioContext.createIIRFilter(new Float64Array([0.1]), new Float64Array([0.1]));
}
{
  console.log('audioContext.createOscillator()');
  const node = audioContext.createOscillator();
}
{
  console.log('audioContext.createPanner()');
  const node = audioContext.createPanner();
}
{
  console.log('audioContext.createStereoPanner()');
  const node = audioContext.createStereoPanner();
}
{
  console.log('audioContext.createWaveShaper()');
  const node = audioContext.createWaveShaper();
}

console.log('');
console.log('## constructors');
console.log('');

{
  console.log('new AnalyserNode(audioContext)')
  const node = new AnalyserNode(audioContext);
}
{
  console.log('new AudioBufferSourceNode(audioContext)')
  const node = new AudioBufferSourceNode(audioContext);
}
{
  console.log('new BiquadFilterNode(audioContext)')
  const node = new BiquadFilterNode(audioContext);
}
{
  console.log('new ChannelMergerNode(audioContext)')
  const node = new ChannelMergerNode(audioContext);
}
{
  console.log('new ChannelSplitterNode(audioContext)')
  const node = new ChannelSplitterNode(audioContext);
}
{
  console.log('new ConstantSourceNode(audioContext)')
  const node = new ConstantSourceNode(audioContext);
}
{
  console.log('new ConvolverNode(audioContext)')
  const node = new ConvolverNode(audioContext);
}
{
  console.log('new DelayNode(audioContext)')
  const node = new DelayNode(audioContext);
}
{
  console.log('new DynamicsCompressorNode(audioContext)')
  const node = new DynamicsCompressorNode(audioContext);
}
{
  console.log('new GainNode(audioContext)')
  const node = new GainNode(audioContext);
}
{
  console.log('new IIRFilterNode(audioContext)')
  const node = new IIRFilterNode(audioContext, {
    feedforward: new Float64Array([0.1]),
    feedback: new Float64Array([0.1]),
  });
}
{
  console.log('new OscillatorNode(audioContext)')
  const node = new OscillatorNode(audioContext);
}
{
  console.log('new PannerNode(audioContext)')
  const node = new PannerNode(audioContext);
}
{
  console.log('new StereoPannerNode(audioContext)')
  const node = new StereoPannerNode(audioContext);
}
{
  console.log('new WaveShaperNode(audioContext)')
  const node = new WaveShaperNode(audioContext);
}

if (audioContext.close) {
  audioContext.close();
}
