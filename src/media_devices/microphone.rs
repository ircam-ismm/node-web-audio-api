use napi::*;
use napi_derive::js_function;
use web_audio_api::media::Microphone;

pub(crate) struct NapiMicrophone(Microphone);

impl NapiMicrophone {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class("Microphone", constructor, &[])
    }

    pub fn unwrap(&self) -> &Microphone {
        &self.0
    }
}

#[js_function]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let mic = Microphone::default();

    let napi_mic = NapiMicrophone(mic);
    ctx.env.wrap(&mut js_this, napi_mic)?;

    ctx.env.get_undefined()
}
