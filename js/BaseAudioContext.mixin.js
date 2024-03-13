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

const { AudioDestinationNode } = require('./AudioDestinationNode.js');
const { isFunction } = require('./lib/utils.js');

module.exports = (superclass, bindings) => {
  const {
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
        const audioBuffer = super.decodeAudioData(audioData);

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

    createPeriodicWave(real, imag) {
      return new PeriodicWave(this, { real, imag });
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
      const options = { numberOfInputs };
      return new ChannelMergerNode(this, options);
    }

    createChannelSplitter(numberOfOutputs) {
      const options = { numberOfOutputs };
      return new ChannelSplitterNode(this, options);
    }

    createConstantSource() {
      return new ConstantSourceNode(this);
    }

    createConvolver() {
      return new ConvolverNode(this);
    }

    createDelay(maxDelayTime) {
      const options = { maxDelayTime };
      return new DelayNode(this, options);
    }

    createDynamicsCompressor() {
      return new DynamicsCompressorNode(this);
    }

    createGain() {
      return new GainNode(this);
    }

    createIIRFilter(feedforward, feedback) {
      const options = { feedforward, feedback };
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

  