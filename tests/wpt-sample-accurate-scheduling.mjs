import { AnalyserNode, AudioContext, GainNode, OfflineAudioContext, mediaDevices } from '../index.mjs';

// the-audio-api/the-audiobuffersourcenode-interface/sample-accurate-scheduling.html

let sampleRate = 44100.0;
let lengthInSeconds = 4;

let context = 0;
let bufferLoader = 0;
let impulse;

// See if we can render at exactly these sample offsets.
let sampleOffsets = [0, 3, 512, 517, 1000, 1005, 20000, 21234, 37590];

function createImpulse() {
  // An impulse has a value of 1 at time 0, and is otherwise 0.
  impulse = context.createBuffer(2, 512, sampleRate);
  let sampleDataL = impulse.getChannelData(0);
  let sampleDataR = impulse.getChannelData(1);
  sampleDataL[0] = 1.0;
  sampleDataR[0] = 1.0;
}

function playNote(time) {
  console.log('play at time', time);
  let bufferSource = context.createBufferSource();
  bufferSource.buffer = impulse;
  bufferSource.connect(context.destination);
  bufferSource.start(time);
}

function checkSampleAccuracy(buffer, should) {
  let bufferDataL = buffer.getChannelData(0);
  let bufferDataR = buffer.getChannelData(1);
  // console.log(JSON.stringify(bufferDataL.slice(900, 1100), null, 2));

  let impulseCount = 0;
  let badOffsetCount = 0;

  // Left and right channels must be the same.
  // should(bufferDataL, 'Content of left and right channels match and')
  //     .beEqualToArray(bufferDataR);
  for (let i = 0; i < bufferDataL.length; i++) {
    if (bufferDataL[i] != 0) {
      console.log('non zero found', i);
    }

    if (bufferDataL[i] != bufferDataR[i]) {
      console.log('should be euqal at index', i, bufferDataL[i], bufferDataR[i])
    }
  }

  // Go through every sample and make sure it's 0, except at positions in
  // sampleOffsets.
  for (let i = 0; i < buffer.length; ++i) {
    if (bufferDataL[i] != 0) {
      // Make sure this index is  in sampleOffsets
      let found = false;
      for (let j = 0; j < sampleOffsets.length; ++j) {
        if (sampleOffsets[j] == i) {
          found = true;
          break;
        }
      }

      ++impulseCount;
      console.log(found, 'Non-zero sample found at sample offset ' + i)

      if (!found) {
        ++badOffsetCount;
      }
    }
  }

  console.log('Number of impulses found', impulseCount, sampleOffsets.length)

  if (impulseCount == sampleOffsets.length) {
    console.log('bad offset:', badOffsetCount);
  }
}


// Create offline audio context.
context = new OfflineAudioContext(2, sampleRate * lengthInSeconds, sampleRate);
createImpulse();

for (let i = 0; i < sampleOffsets.length; ++i) {
  let timeInSeconds = sampleOffsets[i] / sampleRate;
  console.log(i, sampleOffsets[i], timeInSeconds);
  playNote(timeInSeconds);
}

context.startRendering().then(function(buffer) {
  checkSampleAccuracy(buffer);
});

