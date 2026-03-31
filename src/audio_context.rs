use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::context::{AudioContext, BaseAudioContext};

use crate::NapiAudioDestinationNode;

#[derive(Clone)]
#[napi]
pub struct NapiAudioContext {
    inner: Arc<AudioContext>, // Arc required for async call / tokyo futures
                              // worklet_id: usize
}

impl NapiAudioContext {
    pub(crate) fn unwrap(&self) -> &AudioContext {
        &self.inner
    }

    // pub(crate) fn worklet_id(&self) -> usize {
    //     self.worklet_id
    // }
}

base_audio_context_impl!(NapiAudioContext, AudioContext);

#[napi]
impl NapiAudioContext {
    #[napi(constructor)]
    pub fn new(mut this: This<Object>) -> Self {
        let native_context = Arc::new(AudioContext::new(Default::default()));

        let napi_context = Self {
            inner: native_context,
        };

        // class instance as JS member
        let native_node = napi_context.unwrap().destination();
        let napi_node = NapiAudioDestinationNode::new(native_node);
        let _ = this.set_named_property("destination", napi_node);

        napi_context
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

    // #[napi(setter, js_name = "sinkId")]
    // pub fn set_sink_id(&self, sink_id: String) -> Result<()> {
    //     let result = self.unwrap().set_sink_id_sync(sink_id.as_str());

    //     match result {
    //         Ok(_) => (),
    //         Err(err) => Error::new(err)
    //     }
    // }

    // #[napi]
    // pub fn resume()

    // #[napi]
    // pub fn suspend()

    // #[napi]
    // pub fn close()
}
