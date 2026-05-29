// required in node_modules/wpt_runner/testharness/idlharness.js, cf `fetch_spec`
import fs from 'node:fs';
import path from 'node:path';

import caller from 'caller';

// some are in wpt/resources
// some are relative to caller site (cf. audiobuffersource-multi-channel)
export default function createFetch(wptPath) {
  return function fetch(pathname) {
    const callerSite = new URL(caller(1));
    const relPathname = path.dirname(callerSite.pathname)
    let buffer;

    if (fs.existsSync(path.join(wptPath, pathname))) {
      buffer = fs.readFileSync(path.join(wptPath, pathname));
    } else if (fs.existsSync(path.join(wptPath, relPathname, pathname))) {
      buffer = fs.readFileSync(path.join(wptPath, relPathname, pathname));
    } else {
      return Promise.resolve({
        ok: false,
        msg: `file ${pathname} not found`,
      });
    }

    return Promise.resolve({
      ok: true,
      text: () => buffer.toString(),
      json: () => JSON.parse(buffer.toString()),
      arrayBuffer: () => buffer.buffer,
    });
  }
};
