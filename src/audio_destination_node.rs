use napi::{
    CallContext, Env, JsFunction, JsObject, JsString, JsUndefined, Property, PropertyAttributes,
    Result,
};
use napi_derive::js_function;

use web_audio_api::context::BaseAudioContext;
use web_audio_api::node::AudioDestinationNode;

use crate::audio_context::NapiAudioContext;
use crate::offline_audio_context::NapiOfflineAudioContext;

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

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioDestinationNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.destination()
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.destination()
        }
        &_ => panic!("not supported"),
    };

    let napi_node = NapiAudioDestinationNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}
