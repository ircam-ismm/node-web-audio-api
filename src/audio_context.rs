use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::context::{AudioContext, BaseAudioContext};

use crate::NapiAudioDestinationNode;
use crate::NapiAudioListener;

pub struct SetSinkIdTask {
    context: Arc<AudioContext>,
    sink_id: String,
}

#[napi]
impl Task for SetSinkIdTask {
    type Output = ();
    type JsValue = ();

    fn compute(&mut self) -> Result<Self::Output> {
        let result = self.context.set_sink_id_sync(self.sink_id.clone());

        match result {
            Ok(audio_buffer) => Ok(audio_buffer),
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    fn resolve(&mut self, _: Env, _: Self::Output) -> Result<Self::JsValue> {
        Ok(())
    }
}

#[derive(Clone)]
#[napi]
pub struct NapiAudioContext {
    inner: Arc<AudioContext>,
    destination: NapiAudioDestinationNode,
    listener: Option<NapiAudioListener>,
    // worklet_id: usize
}

impl NapiAudioContext {
    pub(crate) fn unwrap(&self) -> &AudioContext {
        &self.inner
    }
}

base_audio_context_impl!(NapiAudioContext, AudioContext);

#[napi]
impl NapiAudioContext {
    #[napi(constructor)]
    pub fn new() -> Self {
        // @fixme - napi-3 - handle options

        let native_context = AudioContext::new(Default::default());

        let native_destination = native_context.destination();
        let napi_destination = NapiAudioDestinationNode::new(native_destination);

        Self {
            inner: Arc::new(native_context),
            destination: napi_destination,
            listener: None,
        }
    }

    #[napi(getter, js_name = "destination")]
    pub fn destination(&self) -> NapiAudioDestinationNode {
        self.destination.clone()
    }

    #[napi(getter, js_name = "baseLatency")]
    pub fn base_latency(&self) -> f64 {
        self.unwrap().base_latency()
    }

    #[napi(getter, js_name = "outputLatency")]
    pub fn output_latency(&self) -> f64 {
        self.unwrap().output_latency()
    }

    #[napi(getter, js_name = "sinkId")]
    pub fn sink_id(&self) -> String {
        self.unwrap().sink_id()
    }

    // use task to make delegate async stuff to lib_uv
    #[napi]
    pub fn set_sink_id(&self, sink_id: String) -> AsyncTask<SetSinkIdTask> {
        let context = self.inner.clone();
        let task = SetSinkIdTask { context, sink_id };
        AsyncTask::new(task)
    }

    #[napi]
    pub async fn resume(&self) -> Result<()> {
        self.inner.resume().await;
        Ok(())
    }

    #[napi]
    pub async fn suspend(&self) -> Result<()> {
        self.inner.suspend().await;
        Ok(())
    }

    #[napi]
    pub async fn close(&self) -> Result<()> {
        self.inner.close().await;
        Ok(())
    }

    // attribute EventHandler onsinkchange;
    // attribute EventHandler onerror;
    // [SameObject] readonly attribute AudioPlaybackStats playbackStats;
    // AudioTimestamp getOutputTimestamp ();
}
