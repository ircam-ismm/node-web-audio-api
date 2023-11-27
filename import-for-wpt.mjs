import wptRunner from 'wpt-runner';
import * as webAudioItems from './index.mjs';
import chalk from 'chalk';


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
const testsPath = 'webaudio';
const rootURL = 'webaudio';

// monkey patch `window` with our web audio API
const setup = window => {
  Object.assign(window, webAudioItems);
}

// run all tests for now, @todo - filter from npm command line
const filter = () => true;

// reporter, adapted from default console reporter
// https://github.com/domenic/wpt-runner/blob/master/lib/console-reporter.js
let numPass = 0;
let numFail = 0;

const reporter = {
  startSuite: name => {
    console.log(`\n  ${chalk.bold.underline(name)}\n`);
  },
  pass: message => {
    numPass += 1;
    console.log(chalk.dim(indent(chalk.green("√ ") + message, INDENT_SIZE)));
  },
  fail: message => {
    numFail += 1;
    console.log(chalk.bold.red(indent(`\u00D7 ${message}`, INDENT_SIZE)));
  },
  reportStack: stack => {
    // console.log(colors.dim(indent(stack, INDENT_SIZE * 2)))
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

  process.exit(failures);
} catch (e) {
  console.error(e.stack);
  process.exit(1);
}
