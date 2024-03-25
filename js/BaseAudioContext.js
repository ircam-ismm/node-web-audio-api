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
} = require('./lib/utils.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');
const {
  kNativeAudioBuffer,
} = require('./AudioBuffer.js');

const EventTarget = require('./EventTarget.js');
const AudioListener = require('./AudioListener.js');
const kAudioListener = Symbol('node-web-audio-api:audio-listener');

module.exports = (jsExport /*, nativeBinding */ ) => {
  class BaseAudioContext extends EventTarget {
    constructor(napiObj) {
      super(napiObj);

      this[kNapiObj] = napiObj;
      // AudioListener is lazily instantiated
      this[kAudioListener] = null;

      const destination = new jsExport.AudioDestinationNode(this, napiObj.destination);
      Object.defineProperty(this, 'destination', {
        value: destination,
        writable: false,
      });
    }

    get sampleRate() {
      return this[kNapiObj].sampleRate;
    }

    get currentTime() {
      return this[kNapiObj].currentTime;
    }

    get listener() {
      if (this[kAudioListener] === null) {
        this[kAudioListener] = new AudioListener(this[kNapiObj].listener);
      }

      return this[kAudioListener];
    }

    get state() {
      return this[kNapiObj].state;
    }

    // renderQuantumSize
    // audioWorklet

    get onstatechange() {
      return this._statechange || null;
    }

    set onstatechange(value) {
      if (isFunction(value) || value === null) {
        this._statechange = value;
      }
    }

    // This is not exactly what the spec says, but if we reject the promise
    // when decodeErrorCallback is present the program will crash in an
    // unexpected manner
    // cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-decodeaudiodata
    decodeAudioData(audioData, decodeSuccessCallback, decodeErrorCallback) {
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
      return new jsExport.AnalyserNode(this);
    }

    createBufferSource() {
      return new jsExport.AudioBufferSourceNode(this);
    }

    createBiquadFilter() {
      return new jsExport.BiquadFilterNode(this);
    }

    createChannelMerger(numberOfInputs) {
      const options = {};

      if (numberOfInputs !== undefined) {
        options.numberOfInputs = numberOfInputs;
      }

      return new jsExport.ChannelMergerNode(this, options);
    }

    createChannelSplitter(numberOfOutputs) {
      const options = {};

      if (numberOfOutputs !== undefined) {
        options.numberOfOutputs = numberOfOutputs;
      }

      return new jsExport.ChannelSplitterNode(this, options);
    }

    createConstantSource() {
      return new jsExport.ConstantSourceNode(this);
    }

    createConvolver() {
      return new jsExport.ConvolverNode(this);
    }

    createDelay(maxDelayTime) {
      const options = {};

      if (maxDelayTime !== undefined) {
        options.maxDelayTime = maxDelayTime;
      }

      return new jsExport.DelayNode(this, options);
    }

    createDynamicsCompressor() {
      return new jsExport.DynamicsCompressorNode(this);
    }

    createGain() {
      return new jsExport.GainNode(this);
    }

    createIIRFilter(feedforward, feedback) {
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
      return new jsExport.OscillatorNode(this);
    }

    createPanner() {
      return new jsExport.PannerNode(this);
    }

    createStereoPanner() {
      return new jsExport.StereoPannerNode(this);
    }

    createWaveShaper() {
      return new jsExport.WaveShaperNode(this);
    }

  }

  return BaseAudioContext;
};
