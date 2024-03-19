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

// for debug purpose
// impl Drop for NapiAudioBufferSourceNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiAudioBufferSourceNode dropped");
//     }
// }

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
                Property::new("numberOfInputs")?.with_getter(get_number_of_inputs),
                Property::new("numberOfOutputs")?.with_getter(get_number_of_outputs),
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
                Property::new("__initEventTarget__")?.with_method(init_event_target),
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
    // first argument should be an AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;

    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];
    // check that
    // let audio_context_utf8_name = if let Ok(result) = js_audio_context.has_named_property("Symbol.toStringTag") {
    //     if result {
    //         let audio_context_name = js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    //         let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    //         let audio_context_str = &audio_context_utf8_name[..];

    //         if audio_context_str != "AudioContext" && audio_context_str != "OfflineAudioContext" {
    //             let msg = "TypeError - Failed to construct 'AudioBufferSourceNode': argument 1 is not of type BaseAudioContext";
    //             return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    //         }

    //         audio_context_utf8_name
    //     } else {
    //         let msg = "TypeError - Failed to construct 'AudioBufferSourceNode': argument 1 is not of type BaseAudioContext";
    //         return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    //     }
    // } else {
    //     // This swallowed somehow, .e.g const node = new GainNode(null); throws
    //     // TypeError Cannot convert undefined or null to object
    //     // To be investigated...
    //     let msg = "TypeError - Failed to construct 'AudioBufferSourceNode': argument 1 is not of type BaseAudioContext";
    //     return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    // };

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
    let options = if let Ok(either_options) = ctx.try_get::<JsObject>(1) {
        match either_options {
            Either::A(options_js) => {
                let some_buffer_js = options_js.get::<&str, JsUnknown>("buffer")?;
                let buffer = if let Some(buffer_js) = some_buffer_js {
                    // nullable options
                    match buffer_js.get_type()? {
                        ValueType::Object => {
                            let buffer_js = buffer_js.coerce_to_object()?;
                            let buffer_napi = ctx.env.unwrap::<NapiAudioBuffer>(&buffer_js)?;
                            Some(buffer_napi.unwrap().clone())
                        }
                        ValueType::Null => None,
                        _ => unreachable!(),
                    }
                } else {
                    None
                };

                let some_detune_js = options_js.get::<&str, JsObject>("detune")?;
                let detune = if let Some(detune_js) = some_detune_js {
                    detune_js.coerce_to_number()?.get_double()? as f32
                } else {
                    0.
                };

                let some_loop_js = options_js.get::<&str, JsObject>("loop")?;
                let loop_ = if let Some(loop_js) = some_loop_js {
                    loop_js.coerce_to_bool()?.try_into()?
                } else {
                    false
                };

                let some_loop_end_js = options_js.get::<&str, JsObject>("loopEnd")?;
                let loop_end = if let Some(loop_end_js) = some_loop_end_js {
                    loop_end_js.coerce_to_number()?.get_double()?
                } else {
                    0.
                };

                let some_loop_start_js = options_js.get::<&str, JsObject>("loopStart")?;
                let loop_start = if let Some(loop_start_js) = some_loop_start_js {
                    loop_start_js.coerce_to_number()?.get_double()?
                } else {
                    0.
                };

                let some_playback_rate_js = options_js.get::<&str, JsObject>("playbackRate")?;
                let playback_rate = if let Some(playback_rate_js) = some_playback_rate_js {
                    playback_rate_js.coerce_to_number()?.get_double()? as f32
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
        }
    } else {
        Default::default()
    };

    let audio_context_str = &audio_context_utf8_name[..];
    // create native node
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
        &_ => unreachable!(),
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
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "max" => ChannelCountMode::Max,
        "clamped-max" => ChannelCountMode::ClampedMax,
        "explicit" => ChannelCountMode::Explicit,
        _ => panic!("TypeError - The provided value '{:?}' is not a valid enum value of type ChannelCountMode", utf8_str.as_str()),
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
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "speakers" => ChannelInterpretation::Speakers,
        "discrete" => ChannelInterpretation::Discrete,
        _ => panic!("TypeError - The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", utf8_str.as_str()),
    };
    node.set_channel_interpretation(value);

    ctx.env.get_undefined()
}

#[js_function]
fn get_number_of_inputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_inputs = node.number_of_inputs() as f64;

    ctx.env.create_double(number_of_inputs)
}

#[js_function]
fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_outputs = node.number_of_outputs() as f64;

    ctx.env.create_double(number_of_outputs)
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
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            node.start_at(when);
        }
        2 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            let offset = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
            node.start_at_with_offset(when, offset);
        }
        3 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            let offset = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
            let duration = ctx.get::<JsObject>(2)?.coerce_to_number()?.get_double()?;
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
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            node.stop_at(when);
        }
        _ => (),
    };

    ctx.env.get_undefined()
}

// ----------------------------------------------------
// Private Event Target initialization
// ----------------------------------------------------
#[js_function]
fn init_event_target(ctx: CallContext) -> Result<JsUndefined> {
    use napi::threadsafe_function::{ThreadSafeCallContext, ThreadsafeFunctionCallMode};
    use web_audio_api::Event;

    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    // garb the napi audio context
    let js_audio_context: JsObject = js_this.get_named_property("context")?;
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let dispatch_event_symbol = ctx
        .env
        .symbol_for("node-web-audio-api:napi-dispatch-event")
        .unwrap();
    let js_func = js_this.get_property(dispatch_event_symbol).unwrap();

    let tsfn =
        ctx.env
            .create_threadsafe_function(&js_func, 0, |ctx: ThreadSafeCallContext<Event>| {
                let event_type = ctx.env.create_string(ctx.value.type_)?;
                Ok(vec![event_type])
            })?;

    match audio_context_str {
        "AudioContext" => {
            let napi_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let store_id = napi_context.store_thread_safe_listener(tsfn.clone());
            let napi_context = napi_context.clone();

            node.set_onended(move |e| {
                tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
                napi_context.clear_thread_safe_listener(store_id);
            });
        }
        "OfflineAudioContext" => {
            // do nothing for now as the listeners are never cleaned up which
            // prevent the process to close properly

            // let napi_context = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            // let store_id = napi_context.store_thread_safe_listener(tsfn.clone());
            // let napi_context = napi_context.clone();

            // node.set_onended(move |e| {
            //     tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
            //     napi_context.clear_thread_safe_listener(store_id);
            // });
        }
        &_ => unreachable!(),
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
    ctx.env.create_double(value)
}

#[js_function(0)]
fn get_loop_end(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_end();
    ctx.env.create_double(value)
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

    let value = ctx.get::<JsObject>(0)?.coerce_to_bool()?.try_into()?;
    node.set_loop(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_loop_start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    node.set_loop_start(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_loop_end(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    node.set_loop_end(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------
