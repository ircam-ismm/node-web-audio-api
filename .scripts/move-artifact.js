import fs from 'node:fs';
import path from 'node:path';

import {
  destReleaseFile,
  destDebugFile,
  deleteDevArtifacts,
} from './utils/dev-artifacts-helpers.mjs';

const { platform } = process;
const profile = process.argv.includes('--release') ? 'release' : 'debug';

const pkg = fs.readFileSync('package.json');
const PROJECT_NAME = JSON.parse(pkg).name;
const CARGO_BUILD_NAME = PROJECT_NAME.replace(/-/g, '_');

let buildPrefix = '';
let buildSuffix = '';

switch (platform) {
  case 'win32':
    buildPrefix = '';
    buildSuffix = '.dll';
    break;
  case 'darwin':
    buildPrefix = 'lib';
    buildSuffix = '.dylib';
    break;
  default: // let's hope all linux like have same prefix and suffix...
    buildPrefix = 'lib';
    buildSuffix = '.so';
    break;
}

deleteDevArtifacts();

let srcFile = path.join('target', profile, `${buildPrefix}${CARGO_BUILD_NAME}${buildSuffix}`);
let destFile = profile === 'release' ? destReleaseFile : destDebugFile;

console.log(`> move artifact "${srcFile}" to "${destFile}"`);

fs.copyFileSync(srcFile, destFile);
