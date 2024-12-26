const fs = require('node:fs');
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
          loadError = e;
        }
        break;
      case 'arm64':
        try {
          nativeBinding = require('./node-web-audio-api.win32-arm64-msvc.node');
        } catch (e) {
          loadError = e;
        }
        break;
      default:
        loadError = new Error(`Unsupported architecture on Windows: ${arch}`);
    }
    break;
  case 'darwin':
    switch (arch) {
      case 'x64':
        try {
          nativeBinding = require('./node-web-audio-api.darwin-x64.node');
        } catch (e) {
          loadError = e;
        }
        break;
      case 'arm64':
        try {
          nativeBinding = require('./node-web-audio-api.darwin-arm64.node');
        } catch (e) {
          loadError = e;
        }
        break;
      default:
        loadError = new Error(`Unsupported architecture on macOS: ${arch}`);
    }
    break;
  //   case 'freebsd': x64 only
  case 'linux':
    switch (arch) {
      // @todo
      // - support riscv64 arch
      // - support musl C lib
      case 'x64':
        try {
          nativeBinding = require('./node-web-audio-api.linux-x64-gnu.node');
        } catch (e) {
          loadError = e;
        }
        break;
      case 'arm64':
        try {
          nativeBinding = require('./node-web-audio-api.linux-arm64-gnu.node');
        } catch (e) {
          loadError = e;
        }
        break;
      case 'arm':
        try {
          nativeBinding = require('./node-web-audio-api.linux-arm-gnueabihf.node');
        } catch (e) {
          loadError = e;
        }
        break;
      default:
        loadError = new Error(`Unsupported architecture on Linux: ${arch}`);
    }
    break;
  default:
    loadError = new Error(`Unsupported OS: ${platform}, architecture: ${arch}`);
}

// fallback on local builds
if (fs.existsSync('node-web-audio-api.build-release.node')) {
  nativeBinding = require('./node-web-audio-api.build-release.node');
}

if (fs.existsSync('node-web-audio-api.build-debug.node')) {
  nativeBinding = require('./node-web-audio-api.build-debug.node');
}

if (!nativeBinding) {
  if (loadError) {
    throw loadError;
  }

  throw new Error(`Failed to load native binding for OS: ${platform}, architecture: ${arch}`);
}

module.exports = nativeBinding;

