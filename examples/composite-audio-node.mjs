import { AudioContext, AudioNode } from '../index.mjs'

// Monkeypatching AudioNode.connect to allow for composite nodes.
// Mostly copypasted from:
// https://github.com/GoogleChromeLabs/web-audio-samples/wiki/CompositeAudioNode

class CompositeAudioNode {  

  get _isCompositeAudioNode () {
    return true;
  }
  
  constructor (context, options) {
    this.context = context;
    this._input = this.context.createGain();
    this._output = this.context.createGain();
  }
  
  connect () {
    this._output.connect.apply(this._output, arguments);
  }
  
  disconnect () {
    this._output.disconnect.apply(this._output, arguments);
  }
}

// The AudioNode prototype has to be monkey-patched because
// the native AudioNode wants to connect only to other
// native AudioNodes
AudioNode.prototype._connect = AudioNode.prototype.connect;
AudioNode.prototype.connect = function () {
  var args = Array.prototype.slice.call(arguments);
  if (args[0]._isCompositeAudioNode)
    args[0] = args[0]._input;
  
  this._connect.apply(this, args);
};

class MyCompositeNode extends CompositeAudioNode {

  get gain () {
    return this._amp.gain;
  }

  constructor (context, options) {
    super(context, options);

    // Do stuffs below.
    this._amp = this.context.createGain();
    this._input.connect(this._amp);
    this._amp.connect(this._output);
  }
}

var context = new AudioContext();
var myCompNode = new MyCompositeNode(context);
var oscNode = context.createOscillator();
var gainNode = context.createGain();

myCompNode.gain.value = 0.25;

oscNode.connect(myCompNode);
myCompNode.connect(gainNode);
gainNode.connect(context.destination);

oscNode.start();
oscNode.stop(1.0);
