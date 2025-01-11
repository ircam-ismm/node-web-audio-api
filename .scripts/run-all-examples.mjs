import { fork } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { sleep } from '@ircam/sc-utils';

// run all examples for 2 seconds
const list = fs.readdirSync('examples').filter(filename => filename.endsWith('.js'));
const testDuration = 2;

for (let i = 0; i < list.length; i++) {
  const example = list[i];
  console.log(`
-----------------------------------------------------------------
- ${example}
-----------------------------------------------------------------
`);

  const proc = fork(path.join('examples', example));
  await sleep(testDuration);
  proc.kill('SIGKILL');
}
