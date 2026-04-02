use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::*;

pub struct NapiAudioListener {
    pub(crate) inner: AudioListener
}

impl NapiAudioListener {
    pub(crate) fn new(native_listener: AudioListener) -> Self {
        Self { inner: native_listener };
    }
}

#[napi]
impl NapiAudioListener {
    #[napi]
    pub fn
}
