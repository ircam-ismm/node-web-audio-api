use crate::*;
use napi::*;
use napi_derive::js_function;

use web_audio_api::media_streams::*;

pub(crate) struct NapiMediaStream(MediaStream);

impl NapiMediaStream {
    pub fn new(stream: MediaStream) -> Self {
        Self(stream)
    }

    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class("MediaStream", constructor, &[])
    }

    pub fn unwrap(&self) -> &MediaStream {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    ctx.env.get_undefined()
}
