// required in node_modules/wpt_runner/testharness/idlharness.js, cf `fetch_spec`
const fs = require('node:fs');
const path = require('node:path');

module.exports = function createFetch(basePath) {
  return function fetch(pathname) {
    pathname = path.join(basePath, pathname);

    return new Promise(resolve => {
      if (!fs.existsSync(pathname)) {
        resolve({
          ok: false,
          msg: `file ${pathname} not found`,
        });
      } else {
        const buffer = fs.readFileSync(pathname);

        resolve({
          ok: true,
          text: () => buffer.toString(),
          json: () => JSON.parse(buffer.toString()),
        });
      }
    });
  }
};
