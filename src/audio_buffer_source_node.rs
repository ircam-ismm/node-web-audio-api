use std::rc::Rc;

use napi::{CallContext, Env, JsFunction, JsNumber, JsObject, JsUndefined, Property, Result};
use napi_derive::js_function;

use web_audio_api::node::{AudioBufferSourceNode, AudioNode};

use crate::audio_buffer::NapiAudioBuffer;
use crate::audio_context::NapiAudioContext;
use crate::audio_param::{NapiAudioParam, ParamGetter};

pub(crate) struct NapiAudioBufferSourceNode(Rc<AudioBufferSourceNode>);

impl NapiAudioBufferSourceNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioBufferSourceNode",
            constructor,
            &[
                Property::new("buffer")?.with_setter(buffer),
                Property::new("connect")?.with_method(connect),
                Property::new("start")?.with_method(start),
                Property::new("stop")?.with_method(stop),
            ],
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

    js_this.set_named_property("context", &js_audio_context)?;
    js_this.set_named_property(
        "Symbol.toStringTag",
        ctx.env.create_string("AudioBufferSourceNode")?,
    )?;

    let native_node = Rc::new(AudioBufferSourceNode::new(
        audio_context,
        Default::default(),
    ));

    // AudioParams
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::AudioBufferSourceNodeDetune(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("detune", &js_obj)?;

    let native_clone = native_node.clone();
    let param_getter = ParamGetter::AudioBufferSourceNodePlaybackRate(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("playbackRate", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiAudioBufferSourceNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

#[js_function(1)]
fn buffer(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_obj)?;
    let buffer = napi_obj.unwrap();

    node.set_buffer(buffer.clone());

    ctx.env.get_undefined()
}

connect_method!(NapiAudioBufferSourceNode);

#[js_function(3)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.start();
    } else if ctx.length == 1 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.start_at(when);
    } else if ctx.length == 2 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<JsNumber>(1)?.try_into()?;
        node.start_at_with_offset(when, offset);
    } else if ctx.length == 3 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<JsNumber>(1)?.try_into()?;
        let duration = ctx.get::<JsNumber>(2)?.try_into()?;
        node.start_at_with_offset_and_duration(when, offset, duration);
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
