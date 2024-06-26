import { Blob } from 'node:buffer';
import EventEmitter from 'node:events';

import path from 'path';
import wptRunner from 'wpt-runner';
import chalk from 'chalk';
import { program } from 'commander';

import * as nodeWebAudioAPI from '../index.mjs';

// mocks
import createXMLHttpRequest from './wpt-mock/XMLHttpRequest.js';
import createFetch from './wpt-mock/fetch.js';
import { requestAnimationFrame, cancelAnimationFrame } from './wpt-mock/requestAnimationFrame.js';

program
  .option('--list', 'List the name of the test files')
  .option('--with_crashtests', 'Also run crashtests')
  .option('--filter <string...>', 'Filter executed OR listed test files', ['.*']);

program.parse(process.argv);

const options = program.opts();

// -------------------------------------------------------
// Some helpers
// -------------------------------------------------------
const INDENT_SIZE = 2;

function indent(string, times) {
  const prefix = ' '.repeat(times);
  return string.split("\n").map(l => prefix + l).join("\n");
}

// -------------------------------------------------------
// WPT Runner configuration options
// -------------------------------------------------------
const wptRootPath = path.join('wpt');
const testsPath = path.join('wpt','webaudio');
const rootURL = 'webaudio';

// wpt tests are all run in the same process, but some tests using AudioContext
// do not explicitely call the `close` method. As setup is called before each test
// file we emit a global event so that AudioContext created in previous test file
// can properly close themselves. This prevents them to pile up, continue running,
// create all sorts of problems and waste CPU
process.WPT_TEST_RUNNER = new EventEmitter();

// monkey patch `window` with our web audio API
const setup = window => {
  process.WPT_TEST_RUNNER.emit('cleanup');

  // monkey patch innerText with textContent
  Object.defineProperty(window.HTMLScriptElement.prototype, 'innerText', {
    get: function() {
      return this.textContent;
    },
  })

  // This is meant to make some idlharness tests pass:
  // cf. wpt-runnner/testharness/idlharness.js line 1466-1472
  // These tests, which assess the descriptor of the classes according to window,
  // are of little importance to us but we ensure the rest of the tests are passing
  for (let key in nodeWebAudioAPI) {
    if (key !== 'default' && key !== 'mediaDevices') {
      Object.defineProperty(window, key, {
        __proto__: null,
        writable: true,
        enumerable: false,
        configurable: true,
        value: nodeWebAudioAPI[key],
      });
    }
  }

  // expose media devices API in navigator
  window.navigator.mediaDevices = nodeWebAudioAPI.mediaDevices;
  // window.MediaStream = nodeWebAudioAPI.mediaDevices.MediaStream;

  window.XMLHttpRequest = createXMLHttpRequest(testsPath);
  window.fetch = createFetch(wptRootPath);
  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;

  // populate window with node internals
  window.TypeError = TypeError;
  window.RangeError = RangeError;
  window.Error = Error;
  window.DOMException = DOMException;
  window.Float32Array = Float32Array;
  window.Float64Array = Float64Array;
  window.Uint8Array = Uint8Array;
  window.ArrayBuffer = ArrayBuffer;
  window.Promise = Promise;
  window.Event = Event;
  window.EventTarget = EventTarget;
  window.URL = URL;
  window.Blob = Blob;
  window.SharedArrayBuffer = SharedArrayBuffer;
  // @note - adding Function this crashes some tests:
  // the-pannernode-interface/pannernode-setposition-throws.html
  // the-periodicwave-interface/createPeriodicWaveInfiniteValuesThrows.html
  // window.Function = Function;
}

// try catch unhandled error to prevent wpt process from crashing
process
  .on('unhandledRejection', err => {
    console.error(err.message);
  })
  .on('uncaughtException', err => {
    console.error(err.message);
  });

const filterRe = new RegExp(`${options.filter.join('|')}`);

const filter = (name) => {
  if (!options.with_crashtests && name.includes('/crashtests/')) {
    return false;
  }
  if (name.includes('/resources/')) {
    return false;
  }

  // TODO <https://github.com/ircam-ismm/node-web-audio-api/issues/57>
  // these tests make the runner crash
  if (
     // timeouts
    name.includes('the-audiocontext-interface/suspend-with-navigation.html')
  ) {
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
    if (/threw "[^\"]*Error" instead of/.test(message)) {
      typeErrorFail += 1;
      console.log(chalk.bold.yellow(indent(`| ${message}`, INDENT_SIZE)));
    } else {
      numFail += 1;
      console.log(chalk.bold.red(indent(`\u00D7 ${message}`, INDENT_SIZE)));
    }
  },
  reportStack: stack => {
    console.log(chalk.dim(indent(stack, INDENT_SIZE * 2)));
  },
};

// -------------------------------------------------------
// Run test suite
// -------------------------------------------------------
try {
  console.time('> wpt duration');

  const failures = await wptRunner(testsPath, { rootURL, setup, filter, reporter });

  console.log(`\n  ${chalk.bold.underline('RESULTS:')}`);
  console.log(chalk.bold(`  - # pass: ${numPass}`));
  console.log(chalk.bold(`  - # fail: ${numFail}`));
  console.log(chalk.bold(`  - # type error issues: ${typeErrorFail}`));

  console.timeEnd('> wpt duration');

  process.exit(failures);
} catch (e) {
  console.error(e.stack);
  process.exit(1);
}
