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

import {
  isFunction,
  kEnumerableProperty,
  kHiddenProperty,
} from './lib/utils.js';
import {
  kNapiObj,
  kPrivateConstructor,
} from './lib/symbols.js';

import {
  AudioWorklet,
} from './AudioWorklet.js';
import {
  AudioDestinationNode,
} from './AudioDestinationNode.js';
import {
  AudioListener,
} from './AudioListener.js';
import {
  AudioBuffer,
} from './AudioBuffer.js';
import {
  PeriodicWave,
} from './PeriodicWave.js';
// import nodes for factory methods
import {
  ScriptProcessorNode,
} from './ScriptProcessorNode.js';
import {
  AnalyserNode,
} from './AnalyserNode.js';
import {
  AudioBufferSourceNode,
} from './AudioBufferSourceNode.js';
import {
  BiquadFilterNode,
} from './BiquadFilterNode.js';
import {
  ChannelMergerNode,
} from './ChannelMergerNode.js';
import {
  ChannelSplitterNode,
} from './ChannelSplitterNode.js';
import {
  ConstantSourceNode,
} from './ConstantSourceNode.js';
import {
  ConvolverNode,
} from './ConvolverNode.js';
import {
  DelayNode,
} from './DelayNode.js';
import {
  DynamicsCompressorNode,
} from './DynamicsCompressorNode.js';
import {
  GainNode,
} from './GainNode.js';
import {
  IIRFilterNode,
} from './IIRFilterNode.js';
import {
  OscillatorNode,
} from './OscillatorNode.js';
import {
  PannerNode,
} from './PannerNode.js';
import {
  StereoPannerNode,
} from './StereoPannerNode.js';
import {
  WaveShaperNode,
} from './WaveShaperNode.js';

export class BaseAudioContext extends EventTarget {
  #audioWorklet = null;
  #destination = null;
  #listener = null;
  #statechange = null;

  constructor(options) {
    // Make constructor "private"
    if (
      (typeof options !== 'object') ||
      !(kNapiObj in options)
    ) {
      throw new TypeError('Illegal constructor');
    }

    super();

    Object.defineProperty(this, kNapiObj, {
      value: options[kNapiObj],
      ...kHiddenProperty,
    });

    this.#audioWorklet = new AudioWorklet({
      [kPrivateConstructor]: true,
      workletId: this[kNapiObj].workletId,
      sampleRate: this[kNapiObj].sampleRate,
      renderQuantumSize: this[kNapiObj].renderQuantumSize,
    });

    this.#destination = new AudioDestinationNode(this, {
      [kNapiObj]: this[kNapiObj].destination,
    });
  }

  get audioWorklet() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    return this.#audioWorklet;
  }

  get destination() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    return this.#destination;
  }

  get listener() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    if (this.#listener === null) {
      this.#listener = new AudioListener({
        [kNapiObj]: this[kNapiObj].listener,
      });
    }

    return this.#listener;
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

  get renderQuantumSize() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    return this[kNapiObj].renderQuantumSize;
  }

  get state() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    return this[kNapiObj].state;
  }

  // @fixme - napi-rs 3
  get onstatechange() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    return this.#statechange;
  }

  // @fixme - napi-rs 3
  set onstatechange(value) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    if (isFunction(value) || value === null) {
      this.#statechange = value;
    }
  }

  // This is not exactly what the spec says, but if we reject the promise
  // when decodeErrorCallback is present the program can crash in an
  // unexpected manner
  // cf. https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-decodeaudiodata
  async decodeAudioData(arrayBuffer, decodeSuccessCallback = undefined, decodeErrorCallback = undefined) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    if (arguments.length < 1) {
      throw new TypeError(`Failed to execute 'decodeAudioData' on 'BaseAudioContext': 1 argument required, but only ${arguments.length} present`);
    }

    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new TypeError('Failed to execute "decodeAudioData": parameter 1 is not of type "ArrayBuffer"');
    }

    try {
      const nativeAudioBuffer = await this[kNapiObj].decodeAudioData(arrayBuffer);
      const audioBuffer = new AudioBuffer({
        [kNapiObj]: nativeAudioBuffer,
      });

      if (isFunction(decodeSuccessCallback)) {
        decodeSuccessCallback(audioBuffer);
      } else {
        return audioBuffer;
      }
    } catch (err) {
      const error = new DOMException(`Failed to execute 'decodeAudioData': ${err.message}`, 'EncodingError');

      if (isFunction(decodeErrorCallback)) {
        decodeErrorCallback(error);
      } else {
        throw error;
      }
    }
  }

  createBuffer(numberOfChannels, length, sampleRate) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    if (arguments.length < 3) {
      throw new TypeError(`Failed to execute 'createBuffer' on 'BaseAudioContext': 3 argument required, but only ${arguments.length} present`);
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

    return new AudioBuffer(options);
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

    return new PeriodicWave(this, options);
  }

  // --------------------------------------------------------------------
  // Factory Methods (use the patched AudioNodes)
  // --------------------------------------------------------------------
  createScriptProcessor(bufferSize = 0, numberOfInputChannels = 2, numberOfOutputChannels = 2) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {
      bufferSize,
      numberOfInputChannels,
      numberOfOutputChannels,
    };

    return new ScriptProcessorNode(this, options);
  }

  createAnalyser() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new AnalyserNode(this, options);
  }

  createBufferSource() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new AudioBufferSourceNode(this, options);
  }

  createBiquadFilter() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new BiquadFilterNode(this, options);
  }

  createChannelMerger(numberOfInputs = 6) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {
      numberOfInputs,
    };

    return new ChannelMergerNode(this, options);
  }

  createChannelSplitter(numberOfOutputs = 6) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {
      numberOfOutputs,
    };

    return new ChannelSplitterNode(this, options);
  }

  createConstantSource() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new ConstantSourceNode(this, options);
  }

  createConvolver() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new ConvolverNode(this, options);
  }

  createDelay(maxDelayTime = 1.0) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {
      maxDelayTime,
    };

    return new DelayNode(this, options);
  }

  createDynamicsCompressor() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new DynamicsCompressorNode(this, options);
  }

  createGain() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new GainNode(this, options);
  }

  createIIRFilter(feedforward, feedback) {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {
      feedforward,
      feedback,
    };

    return new IIRFilterNode(this, options);
  }

  createOscillator() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new OscillatorNode(this, options);
  }

  createPanner() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new PannerNode(this, options);
  }

  createStereoPanner() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new StereoPannerNode(this, options);
  }

  createWaveShaper() {
    if (!(this instanceof BaseAudioContext)) {
      throw new TypeError('Invalid Invocation: Value of \'this\' must be of type \'BaseAudioContext\'');
    }

    const options = {};

    return new WaveShaperNode(this, options);
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
  createScriptProcessor: kEnumerableProperty,
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
  audioWorklet: kEnumerableProperty,
  listener: kEnumerableProperty,
  destination: kEnumerableProperty,
  sampleRate: kEnumerableProperty,
  currentTime: kEnumerableProperty,
  renderQuantumSize: kEnumerableProperty,
  state: kEnumerableProperty,
  decodeAudioData: kEnumerableProperty,
  createBuffer: kEnumerableProperty,
  createPeriodicWave: kEnumerableProperty,
  onstatechange: kEnumerableProperty,
});
