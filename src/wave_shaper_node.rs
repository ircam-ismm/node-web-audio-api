// ----------------------------------------------------------
// /! WARNING
// This file has been generated, do not edit
// ----------------------------------------------------------

use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use crate::*;

pub(crate) struct NapiWaveShaperNode(Rc<WaveShaperNode>);

impl NapiWaveShaperNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "WaveShaperNode",
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

    pub fn unwrap(&self) -> &WaveShaperNode {
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
    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("WaveShaperNode")?)?;

    let native_node = Rc::new(WaveShaperNode::new(audio_context, Default::default()));
    
    // finalize instance creation
    let napi_node = NapiWaveShaperNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiWaveShaperNode);
// disconnect_method!(NapiWaveShaperNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------



  