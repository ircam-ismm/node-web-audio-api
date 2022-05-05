// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use crate::*;

pub(crate) struct NapiAnalyserNode(Rc<AnalyserNode>);

impl NapiAnalyserNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AnalyserNode",
            constructor,
            &[
                // Attributes
                Property::new("minDecibels")?
                    .with_getter(get_min_decibels)
                    .with_setter(set_min_decibels),
                Property::new("maxDecibels")?
                    .with_getter(get_max_decibels)
                    .with_setter(set_max_decibels),
                Property::new("smoothingTimeConstant")?
                    .with_getter(get_smoothing_time_constant)
                    .with_setter(set_smoothing_time_constant),
                
                // Methods
                
                // AudioNode interface
                Property::new("connect")?.with_method(connect),
                // Property::new("disconnect")?.with_method(disconnect),
                
            ]
        )
    }

    pub fn unwrap(&self) -> &AnalyserNode {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.set_named_property("context", js_audio_context)?;
    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("AnalyserNode")?)?;

    let native_node = Rc::new(AnalyserNode::new(audio_context, Default::default()));
    
    // finalize instance creation
    let napi_node = NapiAnalyserNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiAnalyserNode);
// disconnect_method!(NapiAnalyserNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_min_decibels(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.min_decibels();
    ctx.env.create_double(value as f64)
}
            
#[js_function(0)]
fn get_max_decibels(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.max_decibels();
    ctx.env.create_double(value as f64)
}
            
#[js_function(0)]
fn get_smoothing_time_constant(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.smoothing_time_constant();
    ctx.env.create_double(value as f64)
}
            
// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_min_decibels(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_min_decibels(value);

    ctx.env.get_undefined()
}
            
#[js_function(1)]
fn set_max_decibels(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_max_decibels(value);

    ctx.env.get_undefined()
}
            
#[js_function(1)]
fn set_smoothing_time_constant(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_smoothing_time_constant(value);

    ctx.env.get_undefined()
}
            


  