// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;

pub(crate) struct NapiAudioBufferSourceNode(AudioBufferSourceNode);

impl NapiAudioBufferSourceNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioBufferSourceNode",
            constructor,
            &[
                // Attributes
                Property::new("buffer")?
                    .with_getter(get_buffer)
                    .with_setter(set_buffer)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("loop")?
                    .with_getter(get_loop)
                    .with_setter(set_loop)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("loopStart")?
                    .with_getter(get_loop_start)
                    .with_setter(set_loop_start)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("loopEnd")?
                    .with_getter(get_loop_end)
                    .with_setter(set_loop_end)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Methods

                // AudioNode interface
                Property::new("channelCount")?
                    .with_getter(get_channel_count)
                    .with_setter(set_channel_count),
                Property::new("channelCountMode")?
                    .with_getter(get_channel_count_mode)
                    .with_setter(set_channel_count_mode),
                Property::new("channelInterpretation")?
                    .with_getter(get_channel_interpretation)
                    .with_setter(set_channel_interpretation),
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("disconnect")?
                    .with_method(disconnect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // AudioScheduledSourceNode interface
                Property::new("start")?
                    .with_method(start)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("stop")?
                    .with_method(stop)
                    .with_property_attributes(PropertyAttributes::Enumerable),
            ],
        )
    }

    // @note: this is also used in audio_node.tmpl.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut AudioBufferSourceNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioBufferSourceNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // parse options
    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let some_buffer_js = options_js.get::<&str, JsObject>("buffer")?;
            let buffer = if let Some(buffer_js) = some_buffer_js {
                let buffer_napi = ctx.env.unwrap::<NapiAudioBuffer>(&buffer_js)?;
                Some(buffer_napi.unwrap().clone())
            } else {
                None
            };

            let some_detune_js = options_js.get::<&str, JsNumber>("detune")?;
            let detune = if let Some(detune_js) = some_detune_js {
                detune_js.get_double()? as f32
            } else {
                0.
            };

            let some_loop_js = options_js.get::<&str, JsBoolean>("loop")?;
            let loop_ = if let Some(loop_js) = some_loop_js {
                loop_js.try_into()?
            } else {
                false
            };

            let some_loop_end_js = options_js.get::<&str, JsNumber>("loopEnd")?;
            let loop_end = if let Some(loop_end_js) = some_loop_end_js {
                loop_end_js.get_double()? as f64
            } else {
                0.
            };

            let some_loop_start_js = options_js.get::<&str, JsNumber>("loopStart")?;
            let loop_start = if let Some(loop_start_js) = some_loop_start_js {
                loop_start_js.get_double()? as f64
            } else {
                0.
            };

            let some_playback_rate_js = options_js.get::<&str, JsNumber>("playbackRate")?;
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
        Either::B(_) => Default::default(),
    };

    // create native node
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            AudioBufferSourceNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            AudioBufferSourceNode::new(audio_context, options)
        }
        &_ => panic!("not supported"),
    };

    // AudioParam: AudioBufferSourceNode::playbackRate
    let native_param = native_node.playback_rate().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("playbackRate", &js_obj)?;

    // AudioParam: AudioBufferSourceNode::detune
    let native_param = native_node.detune().clone();
    let napi_param = NapiAudioParam::new(native_param);
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
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.channel_count_mode();
    let value_str = match value {
        ChannelCountMode::Max => "max",
        ChannelCountMode::ClampedMax => "clamped-max",
        ChannelCountMode::Explicit => "explicit",
    };

    ctx.env.create_string(value_str)
}

#[js_function(1)]
fn set_channel_count_mode(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "max" => ChannelCountMode::Max,
        "clamped-max" => ChannelCountMode::ClampedMax,
        "explicit" => ChannelCountMode::Explicit,
        _ => panic!("undefined value for ChannelCountMode"),
    };
    node.set_channel_count_mode(value);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_interpretation(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.channel_interpretation();
    let value_str = match value {
        ChannelInterpretation::Speakers => "speakers",
        ChannelInterpretation::Discrete => "discrete",
    };

    ctx.env.create_string(value_str)
}

#[js_function(1)]
fn set_channel_interpretation(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "speakers" => ChannelInterpretation::Speakers,
        "discrete" => ChannelInterpretation::Discrete,
        _ => panic!("undefined value for ChannelInterpretation"),
    };
    node.set_channel_interpretation(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// connect / disconnect macros
// -------------------------------------------------
connect_method!(NapiAudioBufferSourceNode);
disconnect_method!(NapiAudioBufferSourceNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------

#[js_function(3)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    match ctx.length {
        0 => node.start(),
        1 => {
            let when = ctx.get::<JsNumber>(0)?.get_double()?;
            node.start_at(when);
        }
        2 => {
            let when = ctx.get::<JsNumber>(0)?.get_double()?;
            let offset = ctx.get::<JsNumber>(1)?.get_double()?;
            node.start_at_with_offset(when, offset);
        }
        3 => {
            let when = ctx.get::<JsNumber>(0)?.get_double()?;
            let offset = ctx.get::<JsNumber>(1)?.get_double()?;
            let duration = ctx.get::<JsNumber>(2)?.get_double()?;
            node.start_at_with_offset_and_duration(when, offset, duration);
        }
        _ => (),
    }

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    match ctx.length {
        0 => node.stop(),
        1 => {
            let when = ctx.get::<JsNumber>(0)?.try_into()?;
            node.stop_at(when);
        }
        _ => (),
    };

    ctx.env.get_undefined()
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_buffer(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();

    if js_this.has_named_property("__buffer__")? {
        Ok(js_this
            .get_named_property::<JsObject>("__buffer__")?
            .into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}

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
fn set_buffer(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_buffer(obj.clone());
    // store in "private" field for getter (not very clean, to review)
    js_this.set_named_property("__buffer__", js_obj)?;

    ctx.env.get_undefined()
}

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

// -------------------------------------------------
// METHODS
// -------------------------------------------------
