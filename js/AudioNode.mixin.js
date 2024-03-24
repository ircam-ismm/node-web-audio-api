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
  throwSanitizedError,
} = require('./lib/errors.js');
const {
  kNapiObj,
} = require('./lib/symbols.js');

const EventTarget = require('./EventTarget.mixin.js');
const {
  AudioParam,
  kNativeAudioParam,
} = require('./AudioParam.js');
const {
  AudioDestinationNode,
  kNativeAudioDestinationNode,
} = require('./AudioDestinationNode.js');

class AudioNode extends EventTarget {
  constructor(context, napiObj) {
    super(napiObj);

    Object.defineProperty(this, 'context', {
      value: context,
      writable: false,
    });

    this[kNapiObj] = napiObj;
  }

  get numberOfInputs() {
    return this[kNapiObj].numberOfInputs;
  }

  get numberOfOutputs() {
    return this[kNapiObj].numberOfOutputs;
  }

  get channelCount() {
    return this[kNapiObj].channelCount;
  }

  get channelCountMode() {
    return this[kNapiObj].channelCountMode;
  }

  get channelInterpretation() {
    return this[kNapiObj].channelInterpretation;
  }

  set channelCount(value) {
    try {
      this[kNapiObj].channelCount = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  set channelCountMode(value) {
    try {
      this[kNapiObj].channelCountMode = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  set channelInterpretation(value) {
    try {
      this[kNapiObj].channelInterpretation = value;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  // ------------------------------------------------------
  // connect / disconnect
  // ------------------------------------------------------

  // @todo
  // AudioNode connect (AudioNode destinationNode,
  //                    optional unsigned long output = 0,
  //                    optional unsigned long input = 0);
  // undefined connect (AudioParam destinationParam, optional unsigned long output = 0);

  connect(...args) {
    const jsDest = args[0];

    // note that audio listener params are not wrapped
    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    if (args[0] instanceof AudioDestinationNode) {
      args[0] = args[0][kNativeAudioDestinationNode];
    }

    if (args[0] instanceof AudioNode) {
      args[0] = args[0][kNapiObj];
    }

    try {
      this[kNapiObj].connect(...args);
      return jsDest;
    } catch (err) {
      throwSanitizedError(err);
    }
  }

  // @todo
  // undefined disconnect ();
  // undefined disconnect (unsigned long output);
  // undefined disconnect (AudioNode destinationNode);
  // undefined disconnect (AudioNode destinationNode, unsigned long output);
  // undefined disconnect (AudioNode destinationNode,
  //                       unsigned long output,
  //                       unsigned long input);
  // undefined disconnect (AudioParam destinationParam);
  // undefined disconnect (AudioParam destinationParam, unsigned long output);

  disconnect(...args) {
    if (args[0] instanceof AudioParam) {
      args[0] = args[0][kNativeAudioParam];
    }

    if (args[0] instanceof AudioDestinationNode) {
      args[0] = args[0][kNativeAudioDestinationNode];
    }

    if (args[0] instanceof AudioNode) {
      args[0] = args[0][kNapiObj];
    }

    try {
      this[kNapiObj].disconnect(...args);
    } catch (err) {
      throwSanitizedError(err);
    }
  }

}

module.exports = AudioNode;
