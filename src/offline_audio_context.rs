use std::future::Future;
use std::sync::Arc;
use std::task::{Context, Poll, Waker};

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
    pub(crate) worklets: Arc<crate::audio_worklet_node::WorkletChannels>,
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

        let worklets = Arc::new(crate::audio_worklet_node::WorkletChannels::new());

        Self {
            inner: Arc::new(native_context),
            destination: napi_destination,
            listener: None,
            worklets,
        }
    }

    #[napi(getter, js_name = "workletId")]
    pub fn worklet_id(&self) -> u32 {
        self.worklets.main() as u32
    }

    #[napi(getter)]
    pub fn destination(&self) -> NapiAudioDestinationNode {
        self.destination.clone()
    }

    /// Non-standard: render the render groups on `threads` threads, before rendering starts
    #[napi(js_name = "setRenderThreads")]
    pub fn set_render_threads(&self, threads: u32) {
        self.inner.set_render_threads(threads as usize);
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

    /// Registers the suspend at once, before a `startRendering` called right
    /// after takes the renderer: as an async fn it registered on a runtime
    /// thread, sometimes once rendering had started, and failed. The first
    /// poll runs up to the wait for that frame; the runtime does the rest.
    #[napi(catch_unwind)]
    pub fn suspend<'env>(&self, env: &'env Env, suspend_time: f64) -> Result<PromiseRaw<'env, ()>> {
        let context = Arc::clone(&self.inner);
        let mut suspended = Box::pin(async move {
            context.suspend(suspend_time).await;
            Ok(())
        });

        let mut cx = Context::from_waker(Waker::noop());
        match suspended.as_mut().poll(&mut cx) {
            Poll::Ready(result) => env.spawn_future(async move { result }),
            Poll::Pending => env.spawn_future(suspended),
        }
    }

    #[napi(catch_unwind)]
    pub async fn resume(&self) -> Result<()> {
        self.inner.resume().await;
        Ok(())
    }

    // oncomplete event is handled on JS side only
}
