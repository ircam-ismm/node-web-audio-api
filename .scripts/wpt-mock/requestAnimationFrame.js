const fps = 60;
const funcs = [];

const skip = Symbol('skip');
const start = Date.now();
let time = start;
let launched = false;

const animFrame = () => {
  const fns = funcs.slice();
  funcs.length = 0;

  const t = Date.now();
  const dt = t - start;
  const t1 = 1e3 / fps;

  for(const f of fns)
    if(f !== skip) f(dt);

  while(time <= t + t1 / 4) time += t1;
  setTimeout(animFrame, time - t);
};

module.exports.requestAnimationFrame = requestAnimationFrame = func => {
  // lazily start timer
  if (!launched) {
    launched = true;
    animFrame();
  }

  funcs.push(func);
  return funcs.length - 1;
};

module.exports.cancelAnimationFrame = cancelAnimationFrame = id => {
  funcs[id] = skip;
};
