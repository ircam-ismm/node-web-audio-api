use napi_derive::js_function;

use napi::{CallContext, Env, JsFunction, JsNumber, JsObject, JsUndefined, Property, Result};
use web_audio_api::context::{AsBaseAudioContext, AudioContext};

use crate::audio_destination_node::NapiAudioDestinationNode;

pub(crate) struct NapiAudioContext(AudioContext);

impl NapiAudioContext {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioContext",
            audio_context_constructor,
            &[
                Property::new("currentTime")?.with_getter(current_time),
                Property::new("sampleRate")?.with_getter(sample_rate),
                Property::new("createGain")?.with_method(create_gain),
                Property::new("createOscillator")?.with_method(create_ocillator),
            ],
        )
    }

    pub fn unwrap(&self) -> &AudioContext {
        &self.0
    }
}

#[js_function]
fn audio_context_constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut this = ctx.this_unchecked::<JsObject>();

    this.set_named_property("Symbol.toStringTag", ctx.env.create_string("AudioContext")?)?;

    let audio_context = AudioContext::new(None);

    // Audio Destination
    let napi_node = NapiAudioDestinationNode::new(audio_context.destination());
    let mut js_obj = NapiAudioDestinationNode::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_node)?;
    this.set_named_property("destination", &js_obj)?;

    // finalize instance creation
    let napi_audio_context = NapiAudioContext(audio_context);
    ctx.env.wrap(&mut this, napi_audio_context)?;

    ctx.env.get_undefined()
}

#[js_function]
fn current_time(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let current_time = obj.current_time();
    ctx.env.create_double(current_time)
}

#[js_function]
fn sample_rate(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let sample_rate = obj.sample_rate().0 as f64;
    ctx.env.create_double(sample_rate)
}

#[js_function]
fn create_gain(ctx: CallContext) -> Result<JsObject> {
  let js_this = ctx.this_unchecked::<JsObject>();

  let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
  let store: JsObject = ctx.env.get_reference_value(store_ref)?;
  let ctor: JsFunction = store.get_named_property("GainNode")?;

  ctor.new_instance(&[js_this])
}

#[js_function]
fn create_ocillator(ctx: CallContext) -> Result<JsObject> {
  let js_this = ctx.this_unchecked::<JsObject>();

  let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
  let store: JsObject = ctx.env.get_reference_value(store_ref)?;
  let ctor: JsFunction = store.get_named_property("OscillatorNode")?;

  ctor.new_instance(&[js_this])
}
