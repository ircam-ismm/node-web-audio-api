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
use crate::*;

pub(crate) struct NapiAudioBufferSourceNode(Rc<AudioBufferSourceNode>);

impl NapiAudioBufferSourceNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioBufferSourceNode",
            constructor,
            &[
                // Attributes
                Property::new("loop")?
                    .with_getter(get_loop)
                    .with_setter(set_loop),
                Property::new("loopStart")?
                    .with_getter(get_loop_start)
                    .with_setter(set_loop_start),
                Property::new("loopEnd")?
                    .with_getter(get_loop_end)
                    .with_setter(set_loop_end),
                
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

    pub fn unwrap(&self) -> &AudioBufferSourceNode {
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
    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("AudioBufferSourceNode")?)?;

    let native_node = Rc::new(AudioBufferSourceNode::new(audio_context, Default::default()));
    
    // AudioParam: AudioBufferSourceNode::playbackRate
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::AudioBufferSourceNodePlaybackRate(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("playbackRate", &js_obj)?;
        
    // AudioParam: AudioBufferSourceNode::detune
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::AudioBufferSourceNodeDetune(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("detune", &js_obj)?;
        
    // finalize instance creation
    let napi_node = NapiAudioBufferSourceNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiAudioBufferSourceNode);
// disconnect_method!(NapiAudioBufferSourceNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
#[js_function(3)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
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

#[js_function(0)]
fn get_loop(ctx: CallContext) -> Result<JsBoolean> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_();
    ctx.env.get_boolean(value)
}
            
#[js_function(0)]
fn get_loop_start(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_start();
    ctx.env.create_double(value as f64)
}
            
#[js_function(0)]
fn get_loop_end(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_end();
    ctx.env.create_double(value as f64)
}
            
// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_loop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsBoolean>(0)?.try_into()?;
    node.set_loop(value);

    ctx.env.get_undefined()
}
            
#[js_function(1)]
fn set_loop_start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_loop_start(value);

    ctx.env.get_undefined()
}
            
#[js_function(1)]
fn set_loop_end(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_loop_end(value);

    ctx.env.get_undefined()
}
            


  