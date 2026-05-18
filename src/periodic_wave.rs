use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::{PeriodicWave, PeriodicWaveOptions};

use crate::*;

#[napi]
pub struct NapiPeriodicWave {
    pub(crate) inner: PeriodicWave,
}

#[napi]
impl NapiPeriodicWave {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Option<Object>,
    ) -> Self {
        let options = match options {
            Some(options) => {
                let real = options.get::<&[f32]>("real");
                let real = real.unwrap_or(None).map(|v| v.to_vec());

                let imag = options.get::<&[f32]>("imag");
                let imag = imag.unwrap_or(None).map(|v| v.to_vec());

                let disable_normalization = options.get::<bool>("disableNormalization");
                let disable_normalization = disable_normalization.unwrap_or(Some(false));
                let disable_normalization = disable_normalization.unwrap_or(false);

                PeriodicWaveOptions {
                    real,
                    imag,
                    disable_normalization,
                }
            }
            None => Default::default(),
        };

        let native_periodic_wave = match context {
            Either::A(context) => {
                let native_context = context.inner();
                PeriodicWave::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.inner();
                PeriodicWave::new(native_context, options)
            }
        };

        Self {
            inner: native_periodic_wave,
        }
    }
}
