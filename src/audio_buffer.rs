use napi::bindgen_prelude::*;
use napi::noop_finalize;
use napi_derive::napi;

use web_audio_api::*;

#[napi]
pub struct NapiAudioBuffer {
    pub(crate) inner: AudioBuffer,
}

impl From<AudioBuffer> for NapiAudioBuffer {
    fn from(audio_buffer: AudioBuffer) -> Self {
        Self {
            inner: audio_buffer,
        }
    }
}

#[napi]
impl NapiAudioBuffer {
    #[napi(constructor, catch_unwind)]
    pub fn new(options: Object) -> Self {
        let number_of_channels = options.get::<u32>("numberOfChannels").unwrap().unwrap() as usize;
        let length = options.get::<u32>("length").unwrap().unwrap() as usize;
        let sample_rate = options.get::<f64>("sampleRate").unwrap().unwrap() as f32;

        let options = AudioBufferOptions {
            number_of_channels,
            length,
            sample_rate,
        };

        Self {
            inner: AudioBuffer::new(options),
        }
    }

    #[napi(getter)]
    pub fn sample_rate(&self) -> f32 {
        self.inner.sample_rate()
    }

    #[napi(getter)]
    pub fn duration(&self) -> f64 {
        self.inner.duration()
    }

    #[napi(getter)]
    pub fn length(&self) -> u32 {
        self.inner.length() as u32
    }

    #[napi(getter)]
    pub fn number_of_channels(&self) -> u32 {
        self.inner.number_of_channels() as u32
    }

    #[napi(catch_unwind)]
    pub fn copy_to_channel(&mut self, source: &[f32], channel_number: u32, offset: Option<u32>) {
        let channel_number = channel_number as usize;
        let offset = offset.unwrap_or(0) as usize;
        self.inner
            .copy_to_channel_with_offset(source, channel_number, offset);
    }

    #[napi(catch_unwind)]
    pub fn copy_from_channel(
        &self,
        mut dest: Float32ArraySlice,
        channel_number: u32,
        offset: Option<u32>,
    ) {
        // Safety: this is all synchronous, then there is no safety problem
        let dest = unsafe { dest.as_mut() };
        let channel_number = channel_number as usize;
        let offset = offset.unwrap_or(0) as usize;
        self.inner
            .copy_from_channel_with_offset(dest, channel_number, offset);
    }

    // cf. https://napi.rs/docs/concepts/typed-array#external-buffers
    // @FIXME - cf. https://github.com/ircam-ismm/node-web-audio-api/issues/80
    #[napi(catch_unwind)]
    pub fn get_channel_data(
        &mut self,
        env: Env,
        channel_number: u32,
    ) -> Result<Float32ArraySlice<'_>> {
        let channel_number = channel_number as usize;
        let channel_data = self.inner.get_channel_data_mut(channel_number);
        let data_ptr = channel_data.as_mut_ptr();
        let len = channel_data.len();

        let channel_data = unsafe {
            // We don't want to drop the underlying data when the buffer is GCed
            // which could cause a double-free error when AudioBuffer is actually dropped
            Float32ArraySlice::from_external(&env, data_ptr, len, data_ptr, noop_finalize)?
        };

        Ok(channel_data)
    }
}

//
