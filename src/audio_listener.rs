use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::context::BaseAudioContext;
use web_audio_api::AudioListener;

pub(crate) struct NapiAudioListener(AudioListener);

impl NapiAudioListener {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioListener",
            constructor,
            &[
                Property::new("setPosition")?.with_method(set_position),
                Property::new("setOrientation")?.with_method(set_orientation),
            ],
        )
    }

    pub fn unwrap(&mut self) -> &mut AudioListener {
        &mut self.0
    }
}

// https://webaudio.github.io/web-audio-api/#AudioListener
//
// @note: should be a private constructor
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
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioParam")?;

    let native_param = native_node.position_x().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("positionX", &js_obj)?;

    let native_param = native_node.position_y().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("positionY", &js_obj)?;

    let native_param = native_node.position_z().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("positionZ", &js_obj)?;

    let native_param = native_node.forward_x().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("forwardX", &js_obj)?;

    let native_param = native_node.forward_y().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("forwardY", &js_obj)?;

    let native_param = native_node.forward_z().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("forwardZ", &js_obj)?;

    let native_param = native_node.up_x().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("upX", &js_obj)?;

    let native_param = native_node.up_y().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("upY", &js_obj)?;

    let native_param = native_node.up_z().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    js_this.set_named_property("upZ", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiAudioListener(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

#[js_function(3)]
fn set_position(ctx: CallContext) -> Result<JsUndefined> {
    // TODO https://webaudio.github.io/web-audio-api/#dom-audiolistener-setposition
    //
    // When any of the positionX, positionY, and positionZ AudioParams for this AudioListener have
    // an automation curve set using setValueCurveAtTime() at the time this method is called, a
    // NotSupportedError MUST be thrown.
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let x = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    let y = ctx.get::<JsNumber>(1)?.get_double()? as f32;
    let z = ctx.get::<JsNumber>(2)?.get_double()? as f32;

    node.position_x().set_value(x);
    node.position_y().set_value(y);
    node.position_z().set_value(z);

    ctx.env.get_undefined()
}

#[js_function(6)]
fn set_orientation(ctx: CallContext) -> Result<JsUndefined> {
    // TODO https://webaudio.github.io/web-audio-api/#dom-audiolistener-setorientation
    //
    // If any of the forwardX, forwardY, forwardZ, upX, upY and upZ AudioParams have an automation
    // curve set using setValueCurveAtTime() at the time this method is called, a NotSupportedError
    // MUST be thrown.
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let x_forward = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    let y_forward = ctx.get::<JsNumber>(1)?.get_double()? as f32;
    let z_forward = ctx.get::<JsNumber>(2)?.get_double()? as f32;
    let x_up = ctx.get::<JsNumber>(3)?.get_double()? as f32;
    let y_up = ctx.get::<JsNumber>(4)?.get_double()? as f32;
    let z_up = ctx.get::<JsNumber>(5)?.get_double()? as f32;

    node.forward_x().set_value(x_forward);
    node.forward_y().set_value(y_forward);
    node.forward_z().set_value(z_forward);

    node.up_x().set_value(x_up);
    node.up_y().set_value(y_up);
    node.up_z().set_value(z_up);

    ctx.env.get_undefined()
}
