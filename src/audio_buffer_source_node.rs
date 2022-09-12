// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use crate::*;
use napi_derive::js_function;
use std::rc::Rc;
use web_audio_api::node::*;

pub(crate) struct NapiAudioBufferSourceNode(Rc<AudioBufferSourceNode>);

impl NapiAudioBufferSourceNode {
    pub fn create_js_class(env: &napi::Env) -> napi::Result<napi::JsFunction> {
        env.define_class(
            "AudioBufferSourceNode",
            constructor,
            &[
                // Attributes
                napi::Property::new("buffer")?
                    .with_getter(get_buffer)
                    .with_setter(set_buffer)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                napi::Property::new("loop")?
                    .with_getter(get_loop)
                    .with_setter(set_loop)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                napi::Property::new("loopStart")?
                    .with_getter(get_loop_start)
                    .with_setter(set_loop_start)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                napi::Property::new("loopEnd")?
                    .with_getter(get_loop_end)
                    .with_setter(set_loop_end)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // Methods

                // AudioNode interface
                napi::Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // napi::Property::new("disconnect")?.with_method(disconnect),

                // AudioScheduledSourceNode interface
                napi::Property::new("start")?
                    .with_method(start)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                napi::Property::new("stop")?
                    .with_method(stop)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
            ],
        )
    }

    pub fn unwrap(&self) -> &AudioBufferSourceNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let mut js_this = ctx.this_unchecked::<napi::JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<napi::JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        napi::Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(napi::PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        napi::Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioBufferSourceNode")?)
            .with_property_attributes(napi::PropertyAttributes::Static),
    ])?;

    // parse options

    let options = match ctx.try_get::<napi::JsObject>(1)? {
        napi::Either::A(options_js) => {
            let some_buffer_js = options_js.get::<&str, napi::JsObject>("buffer")?;
            let buffer = if let Some(buffer_js) = some_buffer_js {
                let buffer_napi = ctx.env.unwrap::<NapiAudioBuffer>(&buffer_js)?;
                Some(buffer_napi.unwrap().clone())
            } else {
                None
            };

            let some_detune_js = options_js.get::<&str, napi::JsNumber>("detune")?;
            let detune = if let Some(detune_js) = some_detune_js {
                detune_js.get_double()? as f32
            } else {
                0.
            };

            let some_loop_js = options_js.get::<&str, napi::JsBoolean>("loop")?;
            let loop_ = if let Some(loop_js) = some_loop_js {
                loop_js.try_into()?
            } else {
                false
            };

            let some_loop_end_js = options_js.get::<&str, napi::JsNumber>("loopEnd")?;
            let loop_end = if let Some(loop_end_js) = some_loop_end_js {
                loop_end_js.get_double()? as f64
            } else {
                0.
            };

            let some_loop_start_js = options_js.get::<&str, napi::JsNumber>("loopStart")?;
            let loop_start = if let Some(loop_start_js) = some_loop_start_js {
                loop_start_js.get_double()? as f64
            } else {
                0.
            };

            let some_playback_rate_js = options_js.get::<&str, napi::JsNumber>("playbackRate")?;
            let playback_rate = if let Some(playback_rate_js) = some_playback_rate_js {
                playback_rate_js.get_double()? as f32
            } else {
                1.
            };

            AudioBufferSourceOptions {
                buffer,
                detune,
                loop_,
                loop_end,
                loop_start,
                playback_rate,
            }
        }
        napi::Either::B(_) => {
            return Err(napi::Error::from_reason(
                "Options are mandatory for node AudioBufferSourceNode".to_string(),
            ));
        }
    };

    let native_node = Rc::new(AudioBufferSourceNode::new(audio_context, options));

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
fn start(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.start();
    } else if ctx.length == 1 {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        node.start_at(when);
    } else if ctx.length == 2 {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<napi::JsNumber>(1)?.try_into()?;
        node.start_at_with_offset(when, offset);
    } else if ctx.length == 3 {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<napi::JsNumber>(1)?.try_into()?;
        let duration = ctx.get::<napi::JsNumber>(2)?.try_into()?;
        node.start_at_with_offset_and_duration(when, offset, duration);
    }

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.stop();
    } else {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        node.stop_at(when);
    };

    ctx.env.get_undefined()
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_buffer(ctx: napi::CallContext) -> napi::Result<napi::JsUnknown> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();

    if js_this.has_named_property("__buffer__")? {
        Ok(js_this
            .get_named_property::<napi::JsObject>("__buffer__")?
            .into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}

#[js_function(0)]
fn get_loop(ctx: napi::CallContext) -> napi::Result<napi::JsBoolean> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_();
    ctx.env.get_boolean(value)
}

#[js_function(0)]
fn get_loop_start(ctx: napi::CallContext) -> napi::Result<napi::JsNumber> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_start();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_loop_end(ctx: napi::CallContext) -> napi::Result<napi::JsNumber> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_end();
    ctx.env.create_double(value as f64)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_buffer(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let mut js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<napi::JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_buffer(obj.clone());
    // store in "private" field for getter (not very clean, to review)
    js_this.set_named_property("__buffer__", js_obj)?;

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_loop(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<napi::JsBoolean>(0)?.try_into()?;
    node.set_loop(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_loop_start(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<napi::JsNumber>(0)?.get_double()? as f64;
    node.set_loop_start(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_loop_end(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<napi::JsNumber>(0)?.get_double()? as f64;
    node.set_loop_end(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------
