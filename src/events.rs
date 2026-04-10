use napi_derive::napi;

#[napi]
pub struct NapiEvent {
    pub(crate) type_: String,
}

#[napi]
impl NapiEvent {
    #[napi(getter, js_name = "type")]
    pub fn type_(&self) -> String {
        self.type_.clone()
    }
}

#[napi]
pub struct NapiAudioRenderCapacityEvent {
    pub timestamp: f64,
    pub average_load: f64,
    pub peak_load: f64,
    pub underrun_ratio: f64,
}
