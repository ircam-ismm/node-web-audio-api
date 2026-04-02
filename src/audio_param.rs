use napi_derive::napi;

// use web_audio_api::context::BaseAudioContext;
use web_audio_api::{AudioParam, AutomationRate};

#[derive(Clone)]
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
    #[napi(getter, js_name = "automationRate")]
    pub fn get_automation_rate(&self) -> String {
        let automation_rate = self.inner.automation_rate();
        let automation_rate = match automation_rate {
            AutomationRate::A => "a-rate",
            AutomationRate::K => "k-rate",
        };

        automation_rate.into()
    }

    #[napi(setter, js_name = "automationRate")]
    pub fn set_automation_rate(&self, automation_rate: String) {
        let automation_rate = match automation_rate.as_str() {
            "a-rate" => AutomationRate::A,
            "k-rate" => AutomationRate::K,
            _ => unreachable!(),
        };
        self.inner.set_automation_rate(automation_rate);
    }

    #[napi(getter, js_name = "defaultValue")]
    pub fn get_default_value(&self) -> f32 {
        self.inner.default_value()
    }

    #[napi(getter, js_name = "maxValue")]
    pub fn get_max_value(&self) -> f32 {
        self.inner.max_value()
    }

    #[napi(getter, js_name = "minValue")]
    pub fn get_min_value(&self) -> f32 {
        self.inner.min_value()
    }

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

    #[napi]
    pub fn set_target_at_time(&self, value: f64, start_time: f64, time_constant: f64) {
        self.inner
            .set_target_at_time(value as f32, start_time, time_constant);
    }

    #[napi]
    pub fn cancel_scheduled_values(&self, cancel_time: f64) {
        self.inner.cancel_scheduled_values(cancel_time);
    }

    #[napi]
    pub fn cancel_and_hold_at_time(&self, cancel_time: f64) {
        self.inner.cancel_and_hold_at_time(cancel_time);
    }
}
