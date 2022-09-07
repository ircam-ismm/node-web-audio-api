import * as dotenv from 'dotenv';
import ping from 'ping';
import { NodeSSH } from 'node-ssh';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'child_process';

dotenv.config({ debug: false });

const rpiHostname = process.env.RPI_HOSTNAME;
const rpiUser = process.env.RPI_USER;
const rpiPrivKey = process.env.RPI_PRIVKEY;
const rpiCwd = process.env.RPI_CWD;
const binaryFilename = 'node-web-audio-api.linux-arm-gnueabihf.node';

console.log(`Check ${rpiHostname} is alive`);
const isAlive = await new Promise((resolve, reject) => {
  ping.sys.probe(rpiHostname, resolve, { timeout: 5 });
});

if (!isAlive) {
  console.log('Cannot connect to host:', rpiHostname);
  console.log('aborting...');
  process.exit(1);
}

const ssh = new NodeSSH();

const conn = await ssh.connect({
  host: rpiHostname,
  username: rpiUser,
  privateKeyPath: rpiPrivKey,
});

let res;

function logResult(res) {
  if (res.stderr !== '') {
    console.log('[rpi stderr]', res.stderr);
  }

  if (res.stdout !== '') {
    console.log('[rpi sdtout]', res.stdout);
  }
}

// @note: by default RPi .bashrc exits early if not in interactive more, some
// lines must be commented on the RPi side
// cf. https://github.com/mscdex/ssh2/issues/77
console.log('> check node');
res = await conn.execCommand(`which node`);
logResult(res);

if (res.stdout == '') {
  console.log('node not found, exiting...');
  process.exit(1)
}

console.log('> check cargo');
res = await conn.execCommand(`which cargo`);
logResult(res);

if (res.stdout == '') {
  console.log('cargo not found, exiting...');
  process.exit(1)
}

console.log('> reinstall node_modules');
res = await conn.execCommand(`rm -Rf node_modules`, { cwd: rpiCwd });
logResult(res);
res = await conn.execCommand(`npm install`, { cwd: rpiCwd });
logResult(res);

console.log('> cargo update');
res = await conn.execCommand(`cargo update`, { cwd: rpiCwd });
logResult(res);

console.log('> build binary');
res = await conn.execCommand(`npm run build`, { cwd: rpiCwd });
logResult(res);

console.log('> list files');
res = await conn.execCommand(`ls -al`, { cwd: rpiCwd });
logResult(res);

console.log('> download binary');
const remoteFile = path.join(rpiCwd, binaryFilename);
res = execSync(`scp ${rpiUser}@${rpiHostname}:${remoteFile} ${process.cwd()}`);
console.log(res.toString());

console.log('Done!');

conn.dispose();




















