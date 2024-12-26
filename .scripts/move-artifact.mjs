import fs from 'node:fs';
import path from 'node:path';

const { platform } = process;
const profile = process.argv.includes('--release') ? 'release' : 'debug';

const pkg = fs.readFileSync(path.join('package.json'));
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

const destReleaseFile = `${PROJECT_NAME}.build-release.node`;
const destDebugFile = `${PROJECT_NAME}.build-debug.node`;

if (fs.existsSync(destReleaseFile)) {
  fs.rmSync(destReleaseFile, { force: true });
}

if (fs.existsSync(destDebugFile)) {
  fs.rmSync(destDebugFile, { force: true });
}

let srcFile = path.join('target', profile, `${buildPrefix}${CARGO_BUILD_NAME}${buildSuffix}`);
let destFile = profile === 'release' ? destReleaseFile : destDebugFile;

console.log(`> move artifact "${srcFile}" to "${destFile}"`);

fs.copyFileSync(srcFile, destFile);
