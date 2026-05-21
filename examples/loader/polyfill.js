import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

// make it sync so that we don't run into weird race conditions in tone.js example
const require = createRequire(import.meta.url);
const examplesDirname = path.join(import.meta.dirname, '..');
const examplesNodeModules = path.join(examplesDirname, 'node_modules');
const nodeModulesExists = fs.existsSync(examplesNodeModules);

if (nodeModulesExists) {
  console.log('> loading installed polyfills');
  require('node-web-audio-api/polyfill.js');;
} else {
  console.log('> loading local polyfills');
  require('../../polyfill.js');
}
