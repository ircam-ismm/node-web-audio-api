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
  MediaStreamAudioSourceNode,
  OscillatorNode,
  PannerNode,
  StereoPannerNode,
  WaveShaperNode,
  // eslint-disable-next-line no-unused-vars
  AudioContext,
  // eslint-disable-next-line no-unused-vars
  OfflineAudioContext,

  AudioBuffer,
  mediaDevices,
} from '../index.mjs';

const audioContext = new OfflineAudioContext(1, 1, 48000);
// const audioContext = new AudioContext();

console.log('## factory methods');
console.log('');

{
  console.log('audioContext.createAnalyser()');
  const node = audioContext.createAnalyser();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createBufferSource()');
  const node = audioContext.createBufferSource();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createBiquadFilter()');
  const node = audioContext.createBiquadFilter();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createChannelMerger()');
  const node = audioContext.createChannelMerger();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createChannelSplitter()');
  const node = audioContext.createChannelSplitter();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createConstantSource()');
  const node = audioContext.createConstantSource();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createConvolver()');
  const node = audioContext.createConvolver();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createDelay()');
  const node = audioContext.createDelay();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createDynamicsCompressor()');
  const node = audioContext.createDynamicsCompressor();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createGain()');
  const node = audioContext.createGain();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createIIRFilter()');
  const node = audioContext.createIIRFilter(new Float64Array([0.1]), new Float64Array([0.1]));
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createOscillator()');
  const node = audioContext.createOscillator();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createPanner()');
  const node = audioContext.createPanner();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createStereoPanner()');
  const node = audioContext.createStereoPanner();
  node.connect(audioContext.destination);
}
{
  console.log('audioContext.createWaveShaper()');
  const node = audioContext.createWaveShaper();
  node.connect(audioContext.destination);
}

console.log('');
console.log('## constructors');
console.log('');

{
  console.log('new AnalyserNode(audioContext)');
  const node = new AnalyserNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new AudioBufferSourceNode(audioContext)');
  const node = new AudioBufferSourceNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new BiquadFilterNode(audioContext)');
  const node = new BiquadFilterNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new ChannelMergerNode(audioContext)');
  const node = new ChannelMergerNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new ChannelSplitterNode(audioContext)');
  const node = new ChannelSplitterNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new ConstantSourceNode(audioContext)');
  const node = new ConstantSourceNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new ConvolverNode(audioContext)');
  const node = new ConvolverNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new DelayNode(audioContext)');
  const node = new DelayNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new DynamicsCompressorNode(audioContext)');
  const node = new DynamicsCompressorNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new GainNode(audioContext)');
  const node = new GainNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new IIRFilterNode(audioContext)');
  const node = new IIRFilterNode(audioContext, {
    feedforward: new Float64Array([0.1]),
    feedback: new Float64Array([0.1]),
  });
  node.connect(audioContext.destination);
}
{
  console.log('new OscillatorNode(audioContext)');
  const node = new OscillatorNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new PannerNode(audioContext)');
  const node = new PannerNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new StereoPannerNode(audioContext)');
  const node = new StereoPannerNode(audioContext);
  node.connect(audioContext.destination);
}
{
  console.log('new WaveShaperNode(audioContext)');
  const node = new WaveShaperNode(audioContext);
  node.connect(audioContext.destination);
}

if (audioContext instanceof AudioContext) {
  console.log('');
  console.log('## AudioContext only');
  console.log('');

  const mediaStream = await mediaDevices.getUserMedia({ audio: true });

  {
    console.log('audioContext.createMediaStreamSource(mediaStream)');
    const node = audioContext.createMediaStreamSource(mediaStream);
    node.connect(audioContext.destination);
  }

  {
    console.log('new MediaStreamAudioSourceNode(audioContext, { mediaStream })');
    const node = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
    node.connect(audioContext.destination);
  }

  console.log('');
  audioContext.close();
} else {
  const output = await audioContext.startRendering();
  console.log('output instanceof AudioBuffer', output instanceof AudioBuffer);
}
