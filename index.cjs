const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const { platform, arch } = process;

let nativeBinding = null;
let loadError = null;

switch (platform) {
  case 'win32':
    switch (arch) {
      case 'x64':
        try {
          nativeBinding = require('./node-web-audio-api.win32-x64-msvc.node');
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        try {
          nativeBinding = require('./node-web-audio-api.win32-arm64-msvc.node');
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Windows: ${arch}`);
    }
    break
  case 'darwin':
    switch (arch) {
      case 'x64':
        try {
          nativeBinding = require('./node-web-audio-api.darwin-x64.node');
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        try {
          nativeBinding = require('./node-web-audio-api.darwin-arm64.node');
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on macOS: ${arch}`);
    }
    break
  case 'linux':
    switch (arch) {
      case 'x64':
        try {
          nativeBinding = require('./node-web-audio-api.linux-x64-gnu.node');
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        try {
          nativeBinding = require('./node-web-audio-api.linux-arm64-gnu.node');
        } catch (e) {
          loadError = e
        }
        break
      case 'arm':
        try {
          nativeBinding = require('./node-web-audio-api.linux-arm-gnueabihf.node');
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Linux: ${arch}`);
    }
    break
  default:
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`);
}

if (!nativeBinding) {
  if (loadError) {
    throw loadError;
  }

  throw new Error(`Failed to load native binding for OS: ${platform}, architecture: ${arch}`);
}

const {
  patchAudioContext,
  patchOfflineAudioContext,
  load,
} = require('./monkey-patch.js');

nativeBinding.AudioContext = patchAudioContext(nativeBinding.AudioContext);
nativeBinding.OfflineAudioContext = patchOfflineAudioContext(nativeBinding.OfflineAudioContext);
nativeBinding.load = load;

module.exports = nativeBinding;

