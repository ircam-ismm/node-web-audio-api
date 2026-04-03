// use napi::bindgen_prelude::*;
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

// #[napi]
// pub struct NapiEvent {
//     pub(crate) type_: String,
//     pub(crate) rendered_buffer:
// }

// #[napi]
// impl NapiEvent {
//     #[napi(getter, js_name = "type")]
//     pub fn type_(&self) -> String {
//         self.type_.clone()
//     }
// }
