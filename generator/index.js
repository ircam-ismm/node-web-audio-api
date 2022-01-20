import fs from 'fs';
import { parse, write, validate } from 'webidl2';

import AudioNodeInterpreter from './AudioNodeInterpreter.js';

const buffer = fs.readFileSync('web-audio.idl');
const content = buffer.toString();
const tree = parse(content);

function log(idl) {
  console.log(JSON.stringify(idl, null, 2));
}

let audioNodes = new Set();

let supportedNodes = [
  `GainNode`,
  `AudioBufferSourceNode`,
  `OscillatorNode`,

  // `AnalyserNode`,
  // `BiquadFilterNode`,
  // `ChannelMergerNode`,
  // `ChannelSplitterNode`,
  // `ConstantSourceNode`,
  // `DelayNode`,
  // `GainNode`,
  // `IIRFilterNode`,
  // `OscillatorNode`,
  // `PannerNode`,
  // `StereoPannerNode`,
  // `WaveShaperNode`,
];

// for stats
let parsed = new Set();
let ignored = new Set();

function findInTree(name) {
  return tree.find(l => l.name === name);
}

supportedNodes.forEach((name, index) => {
  let nodeIdl = findInTree(name);
  console.log(nodeIdl);

  let nodeInterpreter = new AudioNodeInterpreter(nodeIdl, tree);
  let code = nodeInterpreter.render();
  // console.log(code);

  fs.writeFileSync(`output/${nodeInterpreter.slug}.rs`, code);

  audioNodes.add(nodeInterpreter);
});

// write AudioNode macros
// write lib.rs

setInterval(() => {}, 1000);

