// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

const {
  isFunction,
  kEnumerableProperty,
} = require('./lib/utils.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');
const {
  kNativeAudioBuffer,
} = require('./AudioBuffer.js');

const AudioListener = require('./AudioListener.js');

module.exports = (jsExport /*, nativeBinding */ ) => {
  class BaseAudioContext extends EventTarget {
    #listener = null;
    #destination = null;

    constructor(napiObj) {
      super(napiObj);

      this[kNapiObj] = napiObj;

      this.#listener = null; // lazily instanciated
      this.#destination = new jsExport.AudioDestinationNode(this, napiObj.destination);
    }

    get listener() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      if (this.#listener === null) {
        this.#listener = new AudioListener(this[kNapiObj].listener);
      }

      return this.#listener;
    }

    get destination() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return this.#destination;
    }

    get sampleRate() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return this[kNapiObj].sampleRate;
    }

    get currentTime() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return this[kNapiObj].currentTime;
    }

    get state() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return this[kNapiObj].state;
    }

    // renderQuantumSize
    // audioWorklet

    get onstatechange() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return this._statechange || null;
    }

    set onstatechange(value) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      if (isFunction(value) || value === null) {
        this._statechange = value;
      }
    }

    // This is not exactly what the spec says, but if we reject the promise
    // when decodeErrorCallback is present the program will crash in an
    // unexpected manner
    // cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-decodeaudiodata
    decodeAudioData(audioData, decodeSuccessCallback, decodeErrorCallback) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      if (!(audioData instanceof ArrayBuffer)) {
        throw new TypeError('Failed to execute "decodeAudioData": parameter 1 is not of type "ArrayBuffer"');
      }

      try {
        const nativeAudioBuffer = this[kNapiObj].decodeAudioData(audioData);
        const audioBuffer = new jsExport.AudioBuffer({
          [kNativeAudioBuffer]: nativeAudioBuffer,
        });

        if (isFunction(decodeSuccessCallback)) {
          decodeSuccessCallback(audioBuffer);
        } else {
          return Promise.resolve(audioBuffer);
        }
      } catch (err) {
        if (isFunction(decodeErrorCallback)) {
          decodeErrorCallback(err);
        } else {
          return Promise.reject(err);
        }
      }
    }

    createBuffer(numberOfChannels, length, sampleRate) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      const options = {};

      if (numberOfChannels !== undefined) {
        options.numberOfChannels = numberOfChannels;
      }

      if (length !== undefined) {
        options.length = length;
      }

      if (sampleRate !== undefined) {
        options.sampleRate = sampleRate;
      }

      return new jsExport.AudioBuffer(options);
    }

    createPeriodicWave(real, imag) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      if (arguments.length < 2) {
        throw new TypeError(`Failed to execute 'createPeriodicWave' on 'BaseAudioContext': 2 argument required, but only ${arguments.length} present`);
      }

      const options = {};

      if (real !== undefined) {
        options.real = real;
      }

      if (imag !== undefined) {
        options.imag = imag;
      }

      return new jsExport.PeriodicWave(this, options);
    }

    // --------------------------------------------------------------------
    // Factory Methods (use the patched AudioNodes)
    // --------------------------------------------------------------------
    createAnalyser() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.AnalyserNode(this);
    }

    createBufferSource() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.AudioBufferSourceNode(this);
    }

    createBiquadFilter() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.BiquadFilterNode(this);
    }

    createChannelMerger(numberOfInputs) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      const options = {};

      if (numberOfInputs !== undefined) {
        options.numberOfInputs = numberOfInputs;
      }

      return new jsExport.ChannelMergerNode(this, options);
    }

    createChannelSplitter(numberOfOutputs) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      const options = {};

      if (numberOfOutputs !== undefined) {
        options.numberOfOutputs = numberOfOutputs;
      }

      return new jsExport.ChannelSplitterNode(this, options);
    }

    createConstantSource() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.ConstantSourceNode(this);
    }

    createConvolver() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.ConvolverNode(this);
    }

    createDelay(maxDelayTime) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      const options = {};

      if (maxDelayTime !== undefined) {
        options.maxDelayTime = maxDelayTime;
      }

      return new jsExport.DelayNode(this, options);
    }

    createDynamicsCompressor() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.DynamicsCompressorNode(this);
    }

    createGain() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.GainNode(this);
    }

    createIIRFilter(feedforward, feedback) {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      const options = {};

      if (feedforward !== undefined) {
        options.feedforward = feedforward;
      }

      if (feedback !== undefined) {
        options.feedback = feedback;
      }

      return new jsExport.IIRFilterNode(this, options);
    }

    createOscillator() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.OscillatorNode(this);
    }

    createPanner() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.PannerNode(this);
    }

    createStereoPanner() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.StereoPannerNode(this);
    }

    createWaveShaper() {
      if (!(this instanceof BaseAudioContext)) {
        throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
      }

      return new jsExport.WaveShaperNode(this);
    }

  }

  Object.defineProperties(BaseAudioContext, {
    length: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 0,
    },
  });

  Object.defineProperties(BaseAudioContext.prototype, {
    [Symbol.toStringTag]: {
      __proto__: null,
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'BaseAudioContext',
    },

    createAnalyser: kEnumerableProperty,
    createBufferSource: kEnumerableProperty,
    createBiquadFilter: kEnumerableProperty,
    createChannelMerger: kEnumerableProperty,
    createChannelSplitter: kEnumerableProperty,
    createConstantSource: kEnumerableProperty,
    createConvolver: kEnumerableProperty,
    createDelay: kEnumerableProperty,
    createDynamicsCompressor: kEnumerableProperty,
    createGain: kEnumerableProperty,
    createIIRFilter: kEnumerableProperty,
    createOscillator: kEnumerableProperty,
    createPanner: kEnumerableProperty,
    createStereoPanner: kEnumerableProperty,
    createWaveShaper: kEnumerableProperty,

    listener: kEnumerableProperty,
    destination: kEnumerableProperty,
    sampleRate: kEnumerableProperty,
    currentTime: kEnumerableProperty,
    state: kEnumerableProperty,
    onstatechange: kEnumerableProperty,
    decodeAudioData: kEnumerableProperty,
    createBuffer: kEnumerableProperty,
    createPeriodicWave: kEnumerableProperty,
  });

  return BaseAudioContext;
};
