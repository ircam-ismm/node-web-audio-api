use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;
use web_audio_api::{AudioRenderCapacity, AudioRenderCapacityEvent, AudioRenderCapacityOptions};

use crate::NapiAudioRenderCapacityEvent;

#[derive(Clone)]
#[napi(js_name = "NapiAudioRenderCapacity")]
pub struct NapiAudioRenderCapacity {
    inner: Arc<AudioRenderCapacity>,
}

impl NapiAudioRenderCapacity {
    pub(crate) fn new(native_object: AudioRenderCapacity) -> Self {
        Self {
            inner: Arc::new(native_object),
        }
    }
}

#[napi]
impl NapiAudioRenderCapacity {
    #[napi]
    pub fn start(&self, options: Object) {
        let update_interval = options.get::<f64>("updateInterval");
        let update_interval = match update_interval {
            Ok(update_interval) => match update_interval {
                Some(update_interval) => update_interval,
                None => panic!("No default value for updateInterval in AudioRenderCapacityOptions"),
            },
            Err(_) => panic!("No default value for updateInterval in AudioRenderCapacityOptions"),
        };

        let options = AudioRenderCapacityOptions { update_interval };
        self.inner.start(options);
    }

    #[napi]
    pub fn stop(&self) {
        self.inner.stop();
    }

    #[napi]
    pub fn onupdate(&self, callback: Function<NapiAudioRenderCapacityEvent, ()>) -> Result<()> {
        let tsfn = callback
            .build_threadsafe_function()
            .weak::<true>() // do not prevent process to exit
            .build_callback(
                |ctx: napi::threadsafe_function::ThreadsafeCallContext<
                    AudioRenderCapacityEvent,
                >| {
                    let event = NapiAudioRenderCapacityEvent {
                        timestamp: ctx.value.timestamp,
                        average_load: ctx.value.average_load,
                        peak_load: ctx.value.peak_load,
                        underrun_ratio: ctx.value.underrun_ratio,
                    };

                    Ok(event)
                },
            )?;

        self.inner.set_onupdate(move |e: AudioRenderCapacityEvent| {
            tsfn.call(
                e,
                napi::threadsafe_function::ThreadsafeFunctionCallMode::Blocking,
            );
        });

        Ok(())
    }
}
