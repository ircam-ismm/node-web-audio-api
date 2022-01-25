// ----------------------------------------------------------
// ----------------------------------------------------------
// /! WARNING - DO NOT EDIT
// This file has been generated
// ----------------------------------------------------------
// ----------------------------------------------------------

use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use web_audio_api::param::*;

pub(crate) enum ParamGetter {
    AudioBufferSourceNodePlaybackRate(Rc<AudioBufferSourceNode>),
    AudioBufferSourceNodeDetune(Rc<AudioBufferSourceNode>),
    BiquadFilterNodeFrequency(Rc<BiquadFilterNode>),
    BiquadFilterNodeDetune(Rc<BiquadFilterNode>),
    BiquadFilterNodeQ(Rc<BiquadFilterNode>),
    BiquadFilterNodeGain(Rc<BiquadFilterNode>),
    ConstantSourceNodeOffset(Rc<ConstantSourceNode>),
    DelayNodeDelayTime(Rc<DelayNode>),
    GainNodeGain(Rc<GainNode>),
    OscillatorNodeFrequency(Rc<OscillatorNode>),
    OscillatorNodeDetune(Rc<OscillatorNode>),
    StereoPannerNodePan(Rc<StereoPannerNode>),
}

impl ParamGetter {
    fn downcast(&self) -> &AudioParam {
        match *self {
            ParamGetter::AudioBufferSourceNodePlaybackRate(ref node) => node.playback_rate(),
            ParamGetter::AudioBufferSourceNodeDetune(ref node) => node.detune(),
            ParamGetter::BiquadFilterNodeFrequency(ref node) => node.frequency(),
            ParamGetter::BiquadFilterNodeDetune(ref node) => node.detune(),
            ParamGetter::BiquadFilterNodeQ(ref node) => node.q(),
            ParamGetter::BiquadFilterNodeGain(ref node) => node.gain(),
            ParamGetter::ConstantSourceNodeOffset(ref node) => node.offset(),
            ParamGetter::DelayNodeDelayTime(ref node) => node.delay_time(),
            ParamGetter::GainNodeGain(ref node) => node.gain(),
            ParamGetter::OscillatorNodeFrequency(ref node) => node.frequency(),
            ParamGetter::OscillatorNodeDetune(ref node) => node.detune(),
            ParamGetter::StereoPannerNodePan(ref node) => node.pan(),
        }
    }
}

// @note - we can't really create a js class here because ParamGetter must be
// created by the AudioNode that owns the AudioParam
// ... but probably we don't care as AudioParam can't be instanciated from JS
pub(crate) struct NapiAudioParam(ParamGetter);

impl NapiAudioParam {
    pub fn new(param_getter: ParamGetter) -> Self {
        Self(param_getter)
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
        self.0.downcast()
    }
}

#[js_function]
fn get_value(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = obj.value();
    ctx.env.create_double(value as f64)
}

#[js_function(1)]
fn set_value(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    obj.set_value(value);

    ctx.env.get_undefined()
}

#[js_function(2)]
fn set_value_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    let start_time = ctx.get::<JsNumber>(1)?.get_double()?;
    obj.set_value_at_time(value as f32, start_time);

    ctx.env.get_undefined()
}

#[js_function(2)]
fn linear_ramp_to_value_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    let end_time = ctx.get::<JsNumber>(1)?.get_double()? as f64;
    obj.linear_ramp_to_value_at_time(value, end_time);

    ctx.env.get_undefined()
}

#[js_function(2)]
fn exponential_ramp_to_value_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
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
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    let start_time = ctx.get::<JsNumber>(1)?.get_double()? as f64;
    let time_constant = ctx.get::<JsNumber>(2)?.get_double()? as f64;
    obj.set_target_at_time(value, start_time, time_constant);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn cancel_scheduled_values(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let cancel_time = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    obj.cancel_scheduled_values(cancel_time);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn cancel_and_hold_at_time(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let cancel_time = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    obj.cancel_and_hold_at_time(cancel_time);

    ctx.env.get_undefined()
}

  