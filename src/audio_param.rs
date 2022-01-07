use std::rc::Rc;
// use std::cell::Cell;

use napi::{CallContext, Env, JsNumber, JsObject, JsUndefined, Property, Result};
use napi_derive::js_function;

use web_audio_api::node::*;
use web_audio_api::param::AudioParam;

pub(crate) enum ParamGetter {
    GainNodeGain(Rc<GainNode>),
    OscillatorNodeFrequency(Rc<OscillatorNode>),
    AudioBufferSourceNodeDetune(Rc<AudioBufferSourceNode>),
    AudioBufferSourceNodePlaybackRate(Rc<AudioBufferSourceNode>),
}

impl ParamGetter {
    fn get_param(&self) -> &AudioParam {
        let param = match *self {
            ParamGetter::GainNodeGain(ref node) => node.gain(),
            ParamGetter::OscillatorNodeFrequency(ref node) => node.frequency(),
            ParamGetter::AudioBufferSourceNodeDetune(ref node) => node.detune(),
            ParamGetter::AudioBufferSourceNodePlaybackRate(ref node) => node.playback_rate(),
        };

        param
    }
}

pub(crate) struct NapiAudioParam(ParamGetter);

impl NapiAudioParam {
    pub fn new(audio_node_param: ParamGetter) -> Self {
        Self(audio_node_param)
    }

    pub fn create_js_object(env: &Env) -> Result<JsObject> {
        let mut obj = env.create_object()?;

        obj.define_properties(&[
            Property::new("value")?
                .with_getter(get_value)
                .with_setter(set_value),
            Property::new("setValueAtTime")?.with_method(set_value_at_time),
            Property::new("linearRampToValueAtTime")?.with_method(linear_ramp_to_value_at_time),
            Property::new("exponentialRampToValueAtTime")?
                .with_method(exponential_ramp_to_value_at_time),
            Property::new("set_target_at_time")?.with_method(set_target_at_time),
            Property::new("cancel_scheduled_values")?.with_method(cancel_scheduled_values),
            Property::new("cancel_and_hold_at_time")?.with_method(cancel_and_hold_at_time),
        ])?;

        obj.set_named_property("Symbol.toStringTag", env.create_string("AudioParam")?)?;

        Ok(obj)
    }

    pub fn unwrap(&self) -> &AudioParam {
        self.0.get_param()
    }
}

#[js_function]
fn get_value(ctx: CallContext) -> Result<JsNumber> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let value = obj.value();
    ctx.env.create_double(value as f64)
}

#[js_function(1)]
fn set_value(ctx: CallContext) -> Result<JsUndefined> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    obj.set_value(value);

    ctx.env.get_undefined()
}

#[js_function(2)]
fn set_value_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    let start_time = ctx.get::<JsNumber>(1)?.get_double()?;
    obj.set_value_at_time(value as f32, start_time);

    ctx.env.get_undefined()
}

#[js_function(2)]
fn linear_ramp_to_value_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    let end_time = ctx.get::<JsNumber>(1)?.get_double()? as f64;

    obj.linear_ramp_to_value_at_time(value, end_time);

    ctx.env.get_undefined()
}

#[js_function(2)]
fn exponential_ramp_to_value_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    let end_time = ctx.get::<JsNumber>(1)?.get_double()? as f64;
    obj.exponential_ramp_to_value_at_time(value, end_time);

    ctx.env.get_undefined()
}

// #[js_function(3)]
// fn set_value_curve_at_time(ctx: CallContext) -> Result<JsUndefined> {
//   println!("@todo");
//   ctx.env.get_undefined()
// }

#[js_function(3)]
fn set_target_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    let start_time = ctx.get::<JsNumber>(1)?.get_double()? as f64;
    let time_constant = ctx.get::<JsNumber>(2)?.get_double()? as f64;

    obj.set_target_at_time(value, start_time, time_constant);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn cancel_scheduled_values(ctx: CallContext) -> Result<JsUndefined> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let cancel_time = ctx.get::<JsNumber>(0)?.get_double()? as f64;

    obj.cancel_scheduled_values(cancel_time);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn cancel_and_hold_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&this)?;
    let obj = napi_obj.unwrap();

    let cancel_time = ctx.get::<JsNumber>(0)?.get_double()? as f64;

    obj.cancel_and_hold_at_time(cancel_time);

    ctx.env.get_undefined()
}
