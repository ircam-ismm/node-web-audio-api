use napi::{CallContext, Env, JsFunction, JsObject, JsUndefined, Result};
use napi_derive::js_function;

use web_audio_api::context::BaseAudioContext;
use web_audio_api::node::AudioDestinationNode;

use crate::audio_context::NapiAudioContext;

pub struct NapiAudioDestinationNode(AudioDestinationNode);

impl NapiAudioDestinationNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class("AudioDestination", constructor, &[])
    }

    pub fn unwrap(&self) -> &AudioDestinationNode {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.set_named_property(
        "Symbol.toStringTag",
        ctx.env.create_string("AudioDestinationNode")?,
    )?;

    let native_node = audio_context.destination();
    let napi_node = NapiAudioDestinationNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}
