import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse, write, validate } from 'webidl2';
import slugify from '@sindresorhus/slugify';
import camelcase from 'camelcase';
import compile from 'template-literal';

import beautify from 'js-beautify/js/index.js';
import { ESLint } from 'eslint';

const generatedNodes = [
  // @fixme - template is crashing for nodes that have a private constructor (e.g. AudioDestinationNode)
  `AnalyserNode`,
  `AudioBufferSourceNode`,
  `BiquadFilterNode`,
  `ChannelMergerNode`,
  `ChannelSplitterNode`,
  `ConstantSourceNode`,
  `ConvolverNode`,
  `DelayNode`,
  'DynamicsCompressorNode',
  `GainNode`,
  `IIRFilterNode`,
  `MediaStreamAudioSourceNode`,
  `OscillatorNode`,
  `PannerNode`,
  `StereoPannerNode`,
  `WaveShaperNode`,
];

// list of supported nodes, for factory methods, etc.
const audioNodes = [];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @todo - read idl from wpt directory
const idl = fs.readFileSync(path.join(__dirname, 'web-audio.idl')).toString();
const tree = parse(idl);

function generatedPrefix(str) {
  return `\
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

${str}
  `;
}

const utils = {
  log(idl) {
    console.log(JSON.stringify(idl, null, 2));
  },
  debug(value) {
    console.log(JSON.stringify(value, null, 2));
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

    return attrs;
  },

  methods(idl, filterStartStop = true) {
    let methods = idl.members
      .filter(member => member.constructor.name === 'Operation');

    if (filterStartStop) {
      methods = methods
        .filter(member => member.name !== 'start')
        .filter(member => member.name !== 'stop')
    }

    return methods;
  },

  minRequiredArgs(idl) {
    return idl.arguments.reduce((acc, value) => acc += (value.optional ? 0 : 1), 0);
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
      console.warn(`[warning] factory IDL '${name}' not found in BaseAudioContext`);
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

      // edge case for panning model type
      if (str === 'equalpower') {
        str = 'EqualPower';
      }

      return camelcase(str, { pascalCase: true, preserveConsecutiveUppercase: true });
    }

    return camelcase(idl.name, { pascalCase: true, preserveConsecutiveUppercase: true });
  },
};

// For stats
const parsed = new Set();
const ignored = new Set();

function findInTree(name) {
  return tree.find(l => l.name === name);
}

console.log('-------------------------------------------------------------');
console.log('## Generate rs files');
console.log('-------------------------------------------------------------');

let rsTemplates = path.join(__dirname, 'rs');
let rsOutput = path.join(process.cwd(), 'src');

generatedNodes.sort().forEach((name, index) => {
  const nodeIdl = findInTree(name);
  const input = path.join(rsTemplates, `audio_nodes.tmpl.rs`);
  const output = path.join(rsOutput, `${utils.slug(nodeIdl)}.rs`);

  console.log(`- ${path.relative(process.cwd(), output)}`);

  const codeTmpl = fs.readFileSync(input, 'utf8');
  const tmpl = compile(codeTmpl);
  const code = tmpl({ node: nodeIdl, tree, ...utils });

  fs.writeFileSync(output, generatedPrefix(code));
  // add to the list of supported nodes
  audioNodes.push(nodeIdl);
});

// Generate files that require the list of generated AudioNode
['audio_node', 'lib'].forEach(src => {
  const input = path.join(rsTemplates, `${src}.tmpl.rs`);
  const output = path.join(rsOutput, `${src}.rs`);

  console.log(`- ${path.relative(process.cwd(), output)}`);

  const codeTmpl = fs.readFileSync(input, 'utf8');
  const tmpl = compile(codeTmpl);
  const code = tmpl({ nodes: audioNodes, tree, ...utils });

  fs.writeFileSync(output, generatedPrefix(code));
});

console.log('-------------------------------------------------------------');
console.log('## Generate js files');
console.log('-------------------------------------------------------------');

let jsTemplates = path.join(__dirname, 'js');
let jsOutput = path.join(process.cwd(), 'js');

async function beautifyAndLint(pathname, code) {
  // beautfiy
  const beautified = beautify(code, {
    indent_size: 2,
    max_preserve_newlines: 2,
    end_with_newline: true,
    jslint_happy: true,
  });

  // lint
  const eslint = new ESLint({ useEslintrc: true, fix: true });
  const results = await eslint.lintText(beautified, {
    filePath: pathname,
  });
  const problems = results.reduce((acc, result) => acc + result.errorCount + result.warningCount, 0);
  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  if (resultText !== '') {
    console.log(resultText);
  }

  await ESLint.outputFixes(results);

  // no fixes done by eslint
  const output = results[0].output ? results[0].output : beautified;

  fs.writeFileSync(pathname, output);
}

// Generate files that require the list of generated AudioNode
['index', 'monkey-patch', 'BaseAudioContext'].forEach(src => {
  let input;
  let output;
  // index.tmpl.js generates the ES module re-export
  if (src === 'index') {
    input = path.join(jsTemplates, `${src}.tmpl.mjs`);
    output = path.join(process.cwd(), `${src}.mjs`);
  } else {
    input = path.join(jsTemplates, `${src}.tmpl.js`);
    output = path.join(jsOutput, `${src}.js`);
  }

  console.log(`- ${path.relative(process.cwd(), output)}`);

  const codeTmpl = fs.readFileSync(input, 'utf8');
  const tmpl = compile(codeTmpl);
  const code = tmpl({ nodes: audioNodes, ...utils });

  beautifyAndLint(output, generatedPrefix(code));
});

['AudioParam', 'AudioNode'].concat(generatedNodes).forEach(src => {
  const nodeIdl = findInTree(src);
  let input;

  if (['AudioParam', 'AudioNode'].includes(src)) {
    input = path.join(jsTemplates, `${src}.tmpl.js`);
  } else {
    input = path.join(jsTemplates, `AudioNodes.tmpl.js`);
  }

  const output = path.join(jsOutput, `${src}.js`);

  console.log(`- ${path.relative(process.cwd(), output)}`);

  const codeTmpl = fs.readFileSync(input, 'utf8');
  const tmpl = compile(codeTmpl);
  const code = tmpl({ node: nodeIdl, tree, ...utils });

  beautifyAndLint(output, generatedPrefix(code));
});

console.log('');

