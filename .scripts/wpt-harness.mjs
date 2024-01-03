import path from 'path';
import wptRunner from 'wpt-runner';
import chalk from 'chalk';
import { program } from 'commander';

import * as nodeWebAudioAPI from '../index.mjs';

// mocks
import createXMLHttpRequest from './wpt-mock/XMLHttpRequest.js';
import {
  NotSupportedError,
  InvalidStateError,
} from '../js/lib/errors.js';

program
  .option('--list', 'List the name of the test files')
  .option('--with_crashtests', 'Also run crashtests')
  .option('--filter <string>', 'Filter executed OR listed test files', '.*');

program.parse(process.argv);

const options = program.opts();

// -------------------------------------------------------
// Some helpers
// -------------------------------------------------------
const INDENT_SIZE = 2;

function indent(string, times) {
  const prefix = " ".repeat(times);
  return string.split("\n").map(l => prefix + l).join("\n");
}

// -------------------------------------------------------
// WPT Runner configuration options
// -------------------------------------------------------
const testsPath = path.join('wpt','webaudio');
const rootURL = 'webaudio';

// monkey patch `window` with our web audio API
const setup = window => {
  Object.assign(window, nodeWebAudioAPI);

  window.navigator.mediaDevices = nodeWebAudioAPI.mediaDevices;

  // seems required (weirdly...), cf. `the-audiobuffer-interface/audiobuffer.html`
  window.Float32Array = Float32Array;

  // e.g. 'resources/audiobuffersource-multi-channels-expected.wav'
  window.XMLHttpRequest = createXMLHttpRequest(testsPath);
  // errors
  window.TypeError = TypeError;
  window.RangeError = RangeError;
  window.NotSupportedError = NotSupportedError;
  window.InvalidStateError = InvalidStateError;
}

const filterRe = new RegExp(`${options.filter}`);

const filter = (name) => {
  if (!options.with_crashtests && name.includes('/crashtests/')) {
      return false;
  }
  if (name.includes('/resources/')) {
      return false;
  }
  if (filterRe.test(name)) {
    if (options.list) {
      console.log(name);
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

// reporter, adapted from default console reporter
// https://github.com/domenic/wpt-runner/blob/master/lib/console-reporter.js
let numPass = 0;
let numFail = 0;
let typeErrorFail = 0;

const reporter = {
  startSuite: name => {
    console.log(`\n  ${chalk.bold.underline(path.join(testsPath, name))}\n`);
  },
  pass: message => {
    numPass += 1;
    console.log(chalk.dim(indent(chalk.green("√ ") + message, INDENT_SIZE)));
  },
  fail: message => {
    if (/threw "Error" instead of/.test(message)) {
      typeErrorFail += 1;
      console.log(chalk.bold.yellow(indent(`| ${message}`, INDENT_SIZE)));
    } else {
      numFail += 1;
      console.log(chalk.bold.red(indent(`\u00D7 ${message}`, INDENT_SIZE)));
    }
  },
  reportStack: stack => {
    // console.log(chalk.dim(indent(stack, INDENT_SIZE * 2)))
  },
};

// -------------------------------------------------------
// Run test suite
// -------------------------------------------------------
try {
  const failures = await wptRunner(testsPath, { rootURL, setup, filter, reporter });

  console.log(`\n  ${chalk.bold.underline('RESULTS:')}`);
  console.log(chalk.bold(`  - # pass: ${numPass}`));
  console.log(chalk.bold(`  - # fail: ${numFail}`));
  console.log(chalk.bold(`  - # type error issues: ${typeErrorFail}`));

  process.exit(failures);
} catch (e) {
  console.error(e.stack);
  process.exit(1);
}
