import v8 from 'v8';
import vm from 'vm';

if (!global.gc) {
  v8.setFlagsFromString('--expose_gc');
  global.gc = vm.runInNewContext('gc');
}
