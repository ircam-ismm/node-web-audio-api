use std::rc::Rc;

use napi::{CallContext, Env, JsFunction, JsNumber, JsObject, JsUndefined, Property, Result};
use napi_derive::js_function;

use web_audio_api::node::{AudioNode, AudioScheduledSourceNode, OscillatorNode};

use crate::audio_context::NapiAudioContext;
use crate::audio_param::{NapiAudioParam, ParamGetter};

pub(crate) struct NapiOscillatorNode(Rc<OscillatorNode>);

impl NapiOscillatorNode {
  pub fn create_js_class(env: &Env) -> Result<JsFunction> {
    env.define_class(
      "OscillatorNode",
      oscillator_node_constructor,
      &[
        Property::new("connect")?.with_method(connect),
        Property::new("start")?.with_method(start),
        Property::new("stop")?.with_method(stop),
      ],
    )
  }

  pub fn unwrap(&self) -> &OscillatorNode {
    &self.0
  }
}

#[js_function(1)]
fn oscillator_node_constructor(ctx: CallContext) -> Result<JsUndefined> {
  let mut this = ctx.this_unchecked::<JsObject>();

  let js_audio_context = ctx.get::<JsObject>(0)?;
  let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
  let audio_context = napi_audio_context.unwrap();

  this.set_named_property("context", &js_audio_context)?;
  this.set_named_property(
    "Symbol.toStringTag",
    ctx.env.create_string("OscillatorNode")?,
  )?;

  let native_node = Rc::new(OscillatorNode::new(audio_context, Default::default()));

  // AudioParams
  let native_clone = native_node.clone();
  let param_getter = ParamGetter::OscillatorNodeFrequency(native_clone);
  let napi_param = NapiAudioParam::new(param_getter);
  let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
  ctx.env.wrap(&mut js_obj, napi_param)?;
  this.set_named_property("frequency", &js_obj)?;

  // finalize instance creation
  let napi_node = NapiOscillatorNode(native_node);
  ctx.env.wrap(&mut this, napi_node)?;

  ctx.env.get_undefined()
}

connect_method!(NapiOscillatorNode);

#[js_function(1)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
  let this = ctx.this_unchecked::<JsObject>();
  let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&this)?;
  let node = napi_node.unwrap();

  if ctx.length == 0 {
    node.start();
  } else {
    let when = ctx.get::<JsNumber>(0)?.try_into()?;
    node.start_at(when);
  };

  ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
  let this = ctx.this_unchecked::<JsObject>();
  let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&this)?;
  let node = napi_node.unwrap();

  if ctx.length == 0 {
    node.stop();
  } else {
    let when = ctx.get::<JsNumber>(0)?.try_into()?;
    node.stop_at(when);
  };

  ctx.env.get_undefined()
}
