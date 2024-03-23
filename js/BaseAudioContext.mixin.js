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
  AudioDestinationNode,
} = require('./AudioDestinationNode.js');
const {
  isFunction,
} = require('./lib/utils.js');
const {
  kNativeAudioBuffer,
} = require('./AudioBuffer.js');

module.exports = (superclass, bindings) => {
  const {
    /* eslint-disable no-unused-vars */
    AnalyserNode,
    AudioBufferSourceNode,
    BiquadFilterNode,
    ChannelMergerNode,
    ChannelSplitterNode,
    ConstantSourceNode,
    ConvolverNode,
    DelayNode,
    DynamicsCompressorNode,
    GainNode,
    IIRFilterNode,
    MediaStreamAudioSourceNode,
    OscillatorNode,
    PannerNode,
    StereoPannerNode,
    WaveShaperNode,
    /* eslint-enable no-unused-vars */
    AudioBuffer,
    PeriodicWave,
  } = bindings;

  class BaseAudioContext extends superclass {
    constructor(...args) {
      super(...args);

      this.destination = new AudioDestinationNode(this.destination);
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
        const nativeAudioBuffer = super.decodeAudioData(audioData);
        const audioBuffer = new AudioBuffer({
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

      return new AudioBuffer(options);
    }

    createPeriodicWave(real, imag) {
      const options = {};

      if (real !== undefined) {
        options.real = real;
      }

      if (imag !== undefined) {
        options.imag = imag;
      }

      return new PeriodicWave(this, options);
    }

    // --------------------------------------------------------------------
    // Factory Methods (use the patched AudioNodes)
    // --------------------------------------------------------------------
    createAnalyser() {
      return new AnalyserNode(this);
    }

    createBufferSource() {
      return new AudioBufferSourceNode(this);
    }

    createBiquadFilter() {
      return new BiquadFilterNode(this);
    }

    createChannelMerger(numberOfInputs) {
      const options = {};

      if (numberOfInputs !== undefined) {
        options.numberOfInputs = numberOfInputs;
      }

      return new ChannelMergerNode(this, options);
    }

    createChannelSplitter(numberOfOutputs) {
      const options = {};

      if (numberOfOutputs !== undefined) {
        options.numberOfOutputs = numberOfOutputs;
      }

      return new ChannelSplitterNode(this, options);
    }

    createConstantSource() {
      return new ConstantSourceNode(this);
    }

    createConvolver() {
      return new ConvolverNode(this);
    }

    createDelay(maxDelayTime) {
      const options = {};

      if (maxDelayTime !== undefined) {
        options.maxDelayTime = maxDelayTime;
      }

      return new DelayNode(this, options);
    }

    createDynamicsCompressor() {
      return new DynamicsCompressorNode(this);
    }

    createGain() {
      return new GainNode(this);
    }

    createIIRFilter(feedforward, feedback) {
      const options = {};

      if (feedforward !== undefined) {
        options.feedforward = feedforward;
      }

      if (feedback !== undefined) {
        options.feedback = feedback;
      }

      return new IIRFilterNode(this, options);
    }

    createOscillator() {
      return new OscillatorNode(this);
    }

    createPanner() {
      return new PannerNode(this);
    }

    createStereoPanner() {
      return new StereoPannerNode(this);
    }

    createWaveShaper() {
      return new WaveShaperNode(this);
    }

  }

  return BaseAudioContext;
};
