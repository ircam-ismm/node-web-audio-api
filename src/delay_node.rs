// ----------------------------------------------------------
// /! WARNING
// This file has been generated, do not edit
// ----------------------------------------------------------

use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use crate::*;

pub(crate) struct NapiDelayNode(Rc<DelayNode>);

impl NapiDelayNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "DelayNode",
            constructor,
            &[
                // Attributes
                
                // Methods
                
                // AudioNode interface
                Property::new("connect")?.with_method(connect),
                // Property::new("disconnect")?.with_method(disconnect),
                
            ]
        )
    }

    pub fn unwrap(&self) -> &DelayNode {
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
    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("DelayNode")?)?;

    let native_node = Rc::new(DelayNode::new(audio_context, Default::default()));
    
    // AudioParam: DelayNode::delayTime
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::DelayNodeDelayTime(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("delayTime", &js_obj)?;
        
    // finalize instance creation
    let napi_node = NapiDelayNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiDelayNode);
// disconnect_method!(NapiDelayNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------



  