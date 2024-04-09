use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::context::*;
use web_audio_api::node::*;

pub(crate) struct NapiAudioDestinationNode(AudioDestinationNode);

// https://webaudio.github.io/web-audio-api/#AudioDestinationNode
//
// @note: This should be generated as any other AudioNode, but has no constructor
// defined in IDL, so the generation script crashes
impl NapiAudioDestinationNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("maxChannelCount")?.with_getter(get_max_channel_count)
        ];

        env.define_class("AudioDestinationNode", constructor, &interface)
    }

    pub fn unwrap(&self) -> &AudioDestinationNode {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // create native node
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.destination() // this is also different from other audio nodes
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.destination() // this is also different from other audio nodes
        }
        &_ => panic!("not supported"),
    };

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioDestinationNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiAudioDestinationNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiAudioDestinationNode);

// -------------------------------------------------
// AudioDestinationNode Interface
// -------------------------------------------------

#[js_function]
fn get_max_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioDestinationNode>(&js_this)?;
    let node = napi_node.unwrap();

    let max_channel_count = node.max_channel_count() as f64;

    ctx.env.create_double(max_channel_count)
}
