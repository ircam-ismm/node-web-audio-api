import { execFile } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

let cwd = process.cwd();

let getFromGithub = new Promise((resolve, reject) => {
  let pathname = path.join(cwd, 'deploy', 'retrieve-win-mac-builds.mjs');

  execFile(pathname, { cwd }, (err) => {
    if (err) {
      reject(err);
    }

    resolve(true);
  });
});

let result = Promise.all([getFromGithub]);
