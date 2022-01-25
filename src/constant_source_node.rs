// ----------------------------------------------------------
// /! WARNING
// This file has been generated, do not edit
// ----------------------------------------------------------

use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use crate::*;

pub(crate) struct NapiConstantSourceNode(Rc<ConstantSourceNode>);

impl NapiConstantSourceNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "ConstantSourceNode",
            constructor,
            &[
                // Attributes
                
                // Methods
                
                // AudioNode interface
                Property::new("connect")?.with_method(connect),
                // Property::new("disconnect")?.with_method(disconnect),
                
                // AudioScheduledSourceNode interface
                Property::new("start")?.with_method(start),
                Property::new("stop")?.with_method(stop),
            ]
        )
    }

    pub fn unwrap(&self) -> &ConstantSourceNode {
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
    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("ConstantSourceNode")?)?;

    let native_node = Rc::new(ConstantSourceNode::new(audio_context, Default::default()));
    
    // AudioParam: ConstantSourceNode::offset
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::ConstantSourceNodeOffset(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("offset", &js_obj)?;
        
    // finalize instance creation
    let napi_node = NapiConstantSourceNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiConstantSourceNode);
// disconnect_method!(NapiConstantSourceNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
#[js_function(1)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
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
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.stop();
    } else {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.stop_at(when);
    };

    ctx.env.get_undefined()
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------



  