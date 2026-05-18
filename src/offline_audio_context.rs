use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::context::{BaseAudioContext, OfflineAudioContext};

use crate::NapiAudioBuffer;
use crate::NapiAudioDestinationNode;
use crate::NapiAudioListener;

#[derive(Clone)]
#[napi]
pub struct NapiOfflineAudioContext {
    inner: Arc<OfflineAudioContext>,
    destination: NapiAudioDestinationNode,
    listener: Option<NapiAudioListener>,
    pub(crate) worklet_id: usize,
}

impl NapiOfflineAudioContext {
    pub(crate) fn inner(&self) -> &OfflineAudioContext {
        &self.inner
    }
}

base_audio_context_impl!(NapiOfflineAudioContext, OfflineAudioContext);

#[napi]
impl NapiOfflineAudioContext {
    #[napi(constructor, catch_unwind)]
    pub fn new(number_of_channels: u32, length: u32, sample_rate: f64) -> Self {
        let number_of_channels = number_of_channels as usize;
        let length = length as usize;
        let sample_rate = sample_rate as f32;

        let native_context = OfflineAudioContext::new(number_of_channels, length, sample_rate);

        let native_destination = native_context.destination();
        let napi_destination = NapiAudioDestinationNode::new(native_destination);

        let worklet_id = crate::audio_worklet_node::allocate_process_call_channel();

        Self {
            inner: Arc::new(native_context),
            destination: napi_destination,
            listener: None,
            worklet_id,
        }
    }

    #[napi(getter, js_name = "workletId")]
    pub fn worklet_id(&self) -> u32 {
        self.worklet_id as u32
    }

    #[napi(getter)]
    pub fn destination(&self) -> NapiAudioDestinationNode {
        self.destination.clone()
    }

    #[napi(getter)]
    pub fn length(&self) -> u32 {
        self.inner.length() as u32
    }

    #[napi(catch_unwind)]
    pub async fn start_rendering(&self) -> Result<NapiAudioBuffer> {
        let audio_buffer = self.inner.start_rendering().await;
        Ok(NapiAudioBuffer::from(audio_buffer))
    }

    #[napi(catch_unwind)]
    pub async fn suspend(&self, suspend_time: f64) -> Result<()> {
        self.inner.suspend(suspend_time).await;
        Ok(())
    }

    #[napi(catch_unwind)]
    pub async fn resume(&self) -> Result<()> {
        self.inner.resume().await;
        Ok(())
    }

    // oncomplete event is handled on JS side only
}
