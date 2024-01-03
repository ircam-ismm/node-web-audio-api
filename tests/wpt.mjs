import { AudioContext, OfflineAudioContext, mediaDevices } from '../index.mjs';

mediaDevices.enumerateDevices().then((deviceList) => {
  const outputDeviceList =
      deviceList.filter(({kind}) => kind === 'audiooutput');

  console.log(outputDeviceList);
  const firstDeviceId = outputDeviceList[1].deviceId;

  const audioContext = new AudioContext({ sinkId: firstDeviceId });
  audioContext.addEventListener('statechange', () => {
    console.log(audioContext.sinkId === firstDeviceId,
                  'the context sinkId should match the given sinkId.');
    audioContext.close();
    // t.done();
  }, {once: true});

  console.log('coucou');
  audioContext.resume();
});
