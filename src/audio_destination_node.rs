// use napi::bindgen_prelude::*;
use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::node::*;

#[derive(Clone)]
#[napi]
pub struct NapiAudioDestinationNode {
    pub(crate) inner: Arc<AudioDestinationNode>,
}

audio_node_impl!(NapiAudioDestinationNode);

impl NapiAudioDestinationNode {
    pub(crate) fn new(native_node: AudioDestinationNode) -> Self {
        Self {
            inner: Arc::new(native_node),
        }
    }
}

#[napi]
impl NapiAudioDestinationNode {
    // expose inner getter
    #[napi(getter, js_name = "maxChannelCount")]
    pub fn max_channel_count(&self) -> u32 {
        self.inner.max_channel_count() as u32
    }
}
