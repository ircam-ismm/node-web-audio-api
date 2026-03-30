use napi_derive::napi;

// use web_audio_api::context::BaseAudioContext;
use web_audio_api::AudioParam;

#[napi]
pub struct NapiAudioParam {
    pub(crate) inner: AudioParam,
}

impl NapiAudioParam {
    pub fn new(native_param: AudioParam) -> Self {
        Self {
            inner: native_param,
        }
    }
}

#[napi]
impl NapiAudioParam {
    #[napi(getter, js_name = "value")]
    pub fn get_value(&self) -> f32 {
        self.inner.value()
    }

    #[napi(setter, js_name = "value")]
    pub fn set_value(&self, value: f64) {
        self.inner.set_value(value as f32);
    }

    #[napi]
    pub fn set_value_at_time(&self, value: f64, time: f64) {
        self.inner.set_value_at_time(value as f32, time);
    }

    #[napi]
    pub fn linear_ramp_to_value_at_time(&self, value: f64, end_time: f64) {
        self.inner
            .linear_ramp_to_value_at_time(value as f32, end_time);
    }

    #[napi]
    pub fn exponential_ramp_to_value_at_time(&self, value: f64, end_time: f64) {
        self.inner
            .exponential_ramp_to_value_at_time(value as f32, end_time);
    }

    #[napi]
    pub fn set_value_curve_at_time(&self, values: &[f32], start_time: f64, duration: f64) {
        self.inner
            .set_value_curve_at_time(values, start_time, duration);
    }
}
