use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::context::{BaseAudioContext, OfflineAudioContext};

use crate::NapiAudioBuffer;
use crate::NapiAudioDestinationNode;

// pub struct StartRenderingTask {
//     context: Arc<OfflineAudioContext>
// }

// #[napi]
// impl Task for StartRenderingTask {
//     type Output = web_audio_api::AudioBuffer;
//     type JsValue = crate::NapiAudioBuffer;

//     fn compute(&mut self) -> Result<Self::Output> {
//         let audio_buffer = self.context.start_rendering_sync();
//         Ok(audio_buffer)
//     }

//     fn resolve(&mut self, _: Env, output: Self::Output) -> Result<Self::JsValue> {
//         let audio_buffer = $crate::NapiAudioBuffer::from(output);
//         Ok(audio_buffer)
//     }
// }

// pub struct ResumeTask {
//     context: Arc<OfflineAudioContext>
// }

// #[napi]
// impl Task for ResumeTask {
//     type Output = ();
//     type JsValue = JsUndefined;

//     fn compute(&mut self) -> Result<Self::Output> {
//         self.context.resume();
//         Ok(())
//     }

//     fn resolve(&mut self, _: Env, output: Self::Output) -> Result<Self::JsValue> {
//         Ok(())
//     }
// }

// // pub struct SuspendTask {
// //     context: Arc<OfflineAudioContext>
// //     suspend_time: f64,
// // }

// // #[napi]
// // impl Task for SuspendTask {
// //     type Output = ();
// //     type JsValue = JsUndefined;

// //     async fn compute(&mut self) -> Result<Self::Output> {
// //         self.context.suspend(self.suspend_time).await;
// //         Ok(())
// //     }

// //     fn resolve(&mut self, _: Env, output: Self::Output) -> Result<Self::JsValue> {
// //         Ok(())
// //     }
// // }

#[derive(Clone)]
#[napi]
pub struct NapiOfflineAudioContext {
    inner: Arc<OfflineAudioContext>, // Arc required for async call / tokyo futures
                                     // worklet_id: usize
}

impl NapiOfflineAudioContext {
    pub(crate) fn unwrap(&self) -> &OfflineAudioContext {
        &self.inner
    }

    // pub(crate) fn worklet_id(&self) -> usize {
    //     self.worklet_id
    // }
}

base_audio_context_impl!(NapiOfflineAudioContext, OfflineAudioContext);

#[napi]
impl NapiOfflineAudioContext {
    #[napi(constructor)]
    pub fn new(
        mut this: This<Object>,
        number_of_channels: u32,
        length: u32,
        sample_rate: f64,
    ) -> Self {
        let number_of_channels = number_of_channels as usize;
        let length = length as usize;
        let sample_rate = sample_rate as f32;
        // @fixme - napi-3 - handle options
        let native_context = OfflineAudioContext::new(number_of_channels, length, sample_rate);

        let napi_context = Self {
            inner: Arc::new(native_context),
        };

        // create and bind AudioDestinationNode
        let native_node = napi_context.unwrap().destination();
        let napi_node = NapiAudioDestinationNode::new(native_node);
        let _ = this.set_named_property("destination", napi_node);

        napi_context
    }

    #[napi(getter)]
    pub fn length(&self) -> u32 {
        self.inner.length() as u32
    }

    #[napi]
    pub async fn start_rendering(&self) -> Result<NapiAudioBuffer> {
        let audio_buffer = self.inner.start_rendering().await;
        Ok(NapiAudioBuffer::from(audio_buffer))
    }

    #[napi]
    pub async fn suspend(&self, suspend_time: f64) -> Result<()> {
        self.inner.suspend(suspend_time).await;
        Ok(())
    }

    #[napi]
    pub async fn resume(&self) -> Result<()> {
        self.inner.resume().await;
        Ok(())
    }

    // @fixme - napi-rs 3 - oncomplete
}
