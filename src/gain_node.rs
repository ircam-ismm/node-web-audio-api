use std::rc::Rc;

use napi::{CallContext, Env, JsFunction, JsObject, JsUndefined, Property, Result};
use napi_derive::js_function;

use web_audio_api::node::{AudioNode, GainNode};

use crate::audio_context::NapiAudioContext;
use crate::audio_param::{NapiAudioParam, ParamGetter};

pub(crate) struct NapiGainNode(Rc<GainNode>);

impl NapiGainNode {
  pub fn create_js_class(env: &Env) -> Result<JsFunction> {
    env.define_class(
      "GainNode",
      gain_node_constructor,
      &[Property::new("connect")?.with_method(connect)],
    )
  }

  pub fn unwrap(&self) -> &GainNode {
    &self.0
  }
}

#[js_function(1)]
fn gain_node_constructor(ctx: CallContext) -> Result<JsUndefined> {
  let mut this = ctx.this_unchecked::<JsObject>();

  let js_audio_context = ctx.get::<JsObject>(0)?;
  let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
  let audio_context = napi_audio_context.unwrap();

  this.set_named_property("context", &js_audio_context)?;
  this.set_named_property("Symbol.toStringTag", ctx.env.create_string("GainNode")?)?;

  let native_node = Rc::new(GainNode::new(audio_context, Default::default()));

  // AudioParams
  let native_clone = native_node.clone();
  let param_getter = ParamGetter::GainNodeGain(native_clone);
  let napi_param = NapiAudioParam::new(param_getter);
  let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
  ctx.env.wrap(&mut js_obj, napi_param)?;
  this.set_named_property("gain", &js_obj)?;

  // finalize instance creation
  let napi_node = NapiGainNode(native_node);
  ctx.env.wrap(&mut this, napi_node)?;

  ctx.env.get_undefined()
}

connect_method!(NapiGainNode);
