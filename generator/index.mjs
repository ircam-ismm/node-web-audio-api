import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse, write, validate } from 'webidl2';
import slugify from '@sindresorhus/slugify';
import camelcase from 'camelcase';
import compile from 'template-literal';

import beautify from 'js-beautify/js/index.js';
import { ESLint } from 'eslint';

let supportedNodes = [
  // - template are crashing because it has no ctor defined in IDL (to be fixed)
  // 'AudioDestinationNode',
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
  `PannerNode`, // review rs wise, lots of inconsistencies
  `StereoPannerNode`,
  `WaveShaperNode`,
];


// DO NOT OVERRIDE FROM SCRIPT
// Online context only (written manually for now)
// 'MediaStreamAudioSourceNode',

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      console.warn(`!!!!! couldn't find idl for factory ${name} in BaseAudioContext`);
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

let audioNodes = [];

// For stats
const parsed = new Set();
const ignored = new Set();

function findInTree(name) {
  return tree.find(l => l.name === name);
}

console.log('-------------------------------------------------------------');
console.log('## generating rs files');
console.log('-------------------------------------------------------------');

let rsTemplates = path.join(__dirname, 'rs');
let rsOutput = path.join(process.cwd(), 'src');

{ // Generate AudioNodes
  const nodesCodeTmpl = fs.readFileSync(path.join(rsTemplates, `audio_nodes.tmpl.rs`), 'utf8');
  const nodesTmpl = compile(nodesCodeTmpl);

  supportedNodes.sort().forEach((name, index) => {
    const nodeIdl = findInTree(name);
    const pathname = path.join(rsOutput, `${utils.slug(nodeIdl)}.rs`);
    console.log(`> generating file: ${path.relative(process.cwd(), pathname)}`);

    const code = nodesTmpl({
      node: nodeIdl,
      tree,
      ...utils
    });

    fs.writeFileSync(pathname, generatedPrefix(code));

    audioNodes.push(nodeIdl);
  });
}

// Process other nodes and objects that require the list of generate AudioNodes
['audio_node', 'lib'].forEach(src => {
  const pathname = path.join(rsOutput, `${src}.rs`);
  console.log(`> generating file: ${path.relative(process.cwd(), pathname)}`);

  const codeTmpl = fs.readFileSync(path.join(rsTemplates, `${src}.tmpl.rs`), 'utf8');
  const tmpl = compile(codeTmpl);

  const code = tmpl({
    nodes: audioNodes,
    tree,
    ...utils,
  });

  fs.writeFileSync(pathname, generatedPrefix(code));
});

console.log('-------------------------------------------------------------');
console.log('## generating js files');
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

// create the mjs export file
{
  console.log('> generating file: index.mjs (esm re-export)');
  const codeTempl = fs.readFileSync(path.join(jsTemplates, `index.tmpl.mjs`), 'utf8');
  const tmpl = compile(codeTempl);
  const code = tmpl({
    nodes: audioNodes,
    ...utils,
  });

  beautifyAndLint(path.join(process.cwd(), 'index.mjs'), generatedPrefix(code));
}

{
  console.log('> generating file: monkey-patch.js');
  const codeTmpl = fs.readFileSync(path.join(jsTemplates, `monkey-patch.tmpl.js`), 'utf8');
  const tmpl = compile(codeTmpl);
  const code = tmpl({
    nodes: audioNodes,
    ...utils,
  });

  beautifyAndLint(path.join(jsOutput, 'monkey-patch.js'), generatedPrefix(code));
}

{
  const src = 'BaseAudioContext';
  const pathname = path.join(jsOutput, `${src}.js`);
  console.log(`> generating file: ${path.relative(process.cwd(), pathname)}`);

  const codeTmpl = fs.readFileSync(path.join(jsTemplates, `${src}.tmpl.js`), 'utf8');
  const tmpl = compile(codeTmpl);

  const code = tmpl({
    nodes: audioNodes,
    ...utils,
  });

  beautifyAndLint(pathname, generatedPrefix(code));
}

['AudioParam', 'AudioNode'].forEach((src) => {
  const nodeIdl = findInTree(src);
  const pathname = path.join(jsOutput, `${src}.js`);
  console.log(`> generating file: ${path.relative(process.cwd(), pathname)}`);

  const codeTmpl = fs.readFileSync(path.join(jsTemplates, `${src}.tmpl.js`), 'utf8');
  const tmpl = compile(codeTmpl);

  const code = tmpl({
    node: nodeIdl,
    tree,
    ...utils,
  });

  beautifyAndLint(pathname, generatedPrefix(code));
});

supportedNodes.forEach((name, index) => {
  const nodeIdl = findInTree(name);
  const pathname = path.join(jsOutput, `${utils.name(nodeIdl)}.js`);
  console.log(`> generating file: ${path.relative(process.cwd(), pathname)}`);

  const codeTmpl = fs.readFileSync(path.join(jsTemplates, `AudioNodes.tmpl.js`), 'utf8');
  const tmpl = compile(codeTmpl);

  const code = tmpl({
    node: nodeIdl,
    tree,
    ...utils
  });

  beautifyAndLint(pathname, generatedPrefix(code));
});

console.log('');

