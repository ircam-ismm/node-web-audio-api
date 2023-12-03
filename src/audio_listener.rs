use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::context::BaseAudioContext;
use web_audio_api::AudioListener;

pub(crate) struct NapiAudioListener(AudioListener);

impl NapiAudioListener {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class("AudioListener", constructor, &[])
    }
}

// https://webaudio.github.io/web-audio-api/#AudioListener
//
// @note: should be a private constructor
// #todo: implement deprecateds methods: `setOrientation` and `setPosition`
#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    js_this.define_properties(&[
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioListener")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // create native node
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.listener()
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.listener()
        }
        &_ => panic!("not supported"),
    };

    // bind audio params
    let native_param = native_node.position_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionX", &js_obj)?;

    let native_param = native_node.position_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionY", &js_obj)?;

    let native_param = native_node.position_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionZ", &js_obj)?;

    let native_param = native_node.forward_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("forwardX", &js_obj)?;

    let native_param = native_node.forward_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("forwardY", &js_obj)?;

    let native_param = native_node.forward_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("forwardZ", &js_obj)?;

    let native_param = native_node.up_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("upX", &js_obj)?;

    let native_param = native_node.up_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("upY", &js_obj)?;

    let native_param = native_node.up_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("upZ", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiAudioListener(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}
