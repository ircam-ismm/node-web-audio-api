import fs from 'node:fs';

import chalk from 'chalk';

// just check that the changelog has been updated in postversion script
// and display an Warning message if no version entry found

// const version = '1.0.0';
const version = JSON.parse(fs.readFileSync('package.json')).version;
const changelog = fs.readFileSync('CHANGELOG.md').toString();

const versionsInChangelog = changelog.split('\n')
  .filter(line => line.startsWith('##'))
  .map(line => line.split(' ')[1])
  .map(versions => versions.replace(/^v/, ''));

if (!versionsInChangelog.includes(version)) {
  const msg = `> [CHECK CHANGELOG.md] WARNING - no entry found for version v${version}`;
  console.log(chalk.yellow(msg));
} else {
  console.log(chalk.green('> [CHECK CHANGELOG.md] ok'));
}


