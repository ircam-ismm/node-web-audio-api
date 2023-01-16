import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse, write, validate } from 'webidl2';
import slugify from '@sindresorhus/slugify';
import camelcase from 'camelcase';
import compile from 'template-literal';

let supportedNodes = [
  `AudioBufferSourceNode`,
  // `AnalyserNode`,
  `BiquadFilterNode`,
  `ChannelMergerNode`,
  `ChannelSplitterNode`,
  `ConstantSourceNode`,
  `ConvolverNode`,
  `DelayNode`,
  'DynamicsCompressorNode',
  `GainNode`,
  `IIRFilterNode`,
  `OscillatorNode`,
  // `PannerNode`, // review rs wise, lots of inconsistencies
  `StereoPannerNode`,
  `WaveShaperNode`,

  // Online context only (written manually for now)
  // 'MediaStreamAudioSourceNode',
];


const __dirname = path.dirname(fileURLToPath(import.meta.url));

let templates = path.join(__dirname, 'templates');
let output = path.join(process.cwd(), 'src');

const buffer = fs.readFileSync(path.join(__dirname, 'web-audio.idl'));
const content = buffer.toString();
const tree = parse(content);

function generated(str) {
  return `\
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

${str}
  `;
}

const utils = {
  log(idl) {
    console.log(JSON.stringify(idl, null, 2));
  },

  findInTree(name) {
    return tree.find(l => l.name === name);
  },

  parent(idl) {
    return idl.inheritance;
  },

  type(idl) {
    return idl.type;
  },

  memberType(idl) {
    return idl.idlType.idlType;
  },

  constructor(idl) {
    let ctor = idl.members
      .filter(member => member.constructor.name === 'Constructor');

    return ctor[0];
  },

  attributes(idl) {
    let attrs = idl.members
      .filter(member => member.constructor.name === 'Attribute')
      .filter(member => member.idlType.idlType !== 'AudioParam');

    // attrs = attrs.filter(attr => {
    //   if (attr.idlType.idlType === 'float' ||
    //     attr.idlType.idlType === 'double' ||
    //     attr.idlType.idlType === 'boolean' ||
    //     attr.idlType.idlType === 'Float32Array' ||
    //     (this.findInTree(attr.idlType.idlType) &&
    //       this.findInTree(attr.idlType.idlType).type === 'enum') ||
    //     (this.findInTree(attr.idlType.idlType) &&
    //       this.findInTree(attr.idlType.idlType).type === 'interface')
    //   ) {
    //     return true;
    //   } else {
    //     console.log(`+ attribute "${this.name(attr)}: ${this.memberType(attr)}" not parsed`);
    //   }
    // });

    return attrs;
  },

  methods(idl) {
    let methods = idl.members
      .filter(member => member.constructor.name === 'Operation')
      .filter(member => member.name !== 'start')
      .filter(member => member.name !== 'stop')

    return methods;
  },

  audioParams(idl) {
    let params = idl.members
      .filter(member => member.constructor.name === 'Attribute')
      .filter(member => member.idlType.idlType === 'AudioParam');

    return params;
  },

  name(idl) {
    return idl.name;
  },

  optionsName(idl) {
    return idl.name.replace('Node', 'Options');
  },

  napiName(idl) {
    return `Napi${idl.name}`
  },

  factoryName(idl) {
    let factory = this.name(idl);
    factory = factory.replace(/Audio/, '').replace(/Node$/, '');
    factory = `create${factory}`;
    return factory;
  },

  factoryIdl(name) {
    let idl = utils.findInTree('BaseAudioContext').members.find(m => m.name === name);

    if (!idl) {
      throw new Error(`couldn't find idl for factory: ${name}`);
    }

    return idl;
  },

  slug(idl, sanitize = false) {
    if (typeof idl === 'string') {
      return slugify(idl, { separator: '_', preserveTrailingDash: true });
    }

    let slug = slugify(idl.name, { separator: '_', preserveTrailingDash: true });

    if (sanitize) {
      if (slug === 'loop' || slug === 'type') {
        slug += '_';
      }
    }
    return slug;
  },

  camelcase(idl) {
    if (typeof idl === 'string') {
      let str = idl;
      if (str.match(/[0-9]/)) { // oversampling
        str = str.split('').reverse().join('');
      }

      return camelcase(str, { pascalCase: true, preserveConsecutiveUppercase: true });
    }

    return camelcase(idl.name, { pascalCase: true, preserveConsecutiveUppercase: true });
  },
};

// const audioBufferIdl = tree.find(l => l.name === 'AudioBuffer');
// log(audioBufferIdl);

let audioNodes = [];

// for stats
const parsed = new Set();
const ignored = new Set();

function findInTree(name) {
  return tree.find(l => l.name === name);
}

let nodesCodeTmpl = fs.readFileSync(path.join(templates, `audio_nodes.tmpl.rs`), 'utf8');
let nodesTmpl = compile(nodesCodeTmpl);

// process audio nodes
supportedNodes.sort().forEach((name, index) => {
  const nodeIdl = findInTree(name);
  const pathname = path.join(output, `${utils.slug(nodeIdl)}.rs`);
  console.log('> generating file: ', path.relative(process.cwd(), pathname));

  const nodeCode = nodesTmpl({
    node: nodeIdl,
    tree,
    ...utils
  });

  fs.writeFileSync(pathname, generated(nodeCode));

  audioNodes.push(nodeIdl);
});

// process other nodes and objects
['audio_param', 'audio_node', 'lib', 'audio_context', 'offline_audio_context'].forEach(src => {
  const pathname = path.join(output, `${src}.rs`);
  console.log('> generating file: ', path.relative(process.cwd(), pathname));

  let codeTmpl = fs.readFileSync(path.join(templates, `${src}.tmpl.rs`), 'utf8');
  let tmpl = compile(codeTmpl);
  let code = tmpl({
    nodes: audioNodes,
    tree,
    ...utils,
  });

  fs.writeFileSync(pathname, generated(code));
});

// // setInterval(() => {}, 1000);

// create the mjs export file
console.log('> generating esm export file (./index.mjs)');
const esmIndexCodeTempl = fs.readFileSync(path.join(templates, `_create-mjs-export.tmpl.js`), 'utf8');
const esmIndexTmpl = compile(esmIndexCodeTempl);
const esmIndexCode = esmIndexTmpl({
  supportedNodes,
});

fs.writeFileSync(path.join(process.cwd(), 'index.mjs'), generated(esmIndexCode));


