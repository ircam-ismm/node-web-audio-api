import path from 'node:path';
import fs from 'node:fs';

const examplesDirname = path.join(import.meta.dirname, '..');
const examplesNodeModules = path.join(examplesDirname, 'node_modules')
const nodeModulesExists = fs.existsSync(examplesNodeModules);

let mod;

if (nodeModulesExists) {
  console.log('## loading installed dependency');
  mod = await import('node-web-audio-api');;
} else {
  console.log('## loading local build');
  mod = await import('../../index.js');
}

${d.injectExport(d, 'mod.')}
