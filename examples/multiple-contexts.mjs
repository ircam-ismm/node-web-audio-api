import { AudioContext } from '../index.mjs';

{
  console.log('> Creating AudioContext #1 - playing sine at 200Hz')
  const audioContext = new AudioContext();
  const src = audioContext.createOscillator();
  src.frequency.value = 200;
  src.connect(audioContext.destination);
  src.start();
}

{
  console.log('> Creating AudioContext #2 - playing sine at 300Hz')
  const audioContext = new AudioContext();
  const src = audioContext.createOscillator();
  src.frequency.value = 300;
  src.connect(audioContext.destination);
  src.start();
}
