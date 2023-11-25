let webAudioItems;
import('./index.mjs').then((m) => (webAudioItems = m));

function setup(window) {
  if (!webAudioItems) {
    throw new ReferenceError("setup() called before loading webAudioItems");
  }

  Object.assign(window, webAudioItems);
}

module.exports = exports = setup;
