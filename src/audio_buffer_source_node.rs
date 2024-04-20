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
impl Drop for NapiAudioBufferSourceNode {
    fn drop(&mut self) {
        println!("NAPI: NapiAudioBufferSourceNode dropped");
    }
}

impl NapiAudioBufferSourceNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("buffer")?
                .with_getter(get_buffer)
                .with_setter(set_buffer),
            Property::new("loop")?
                .with_getter(get_loop)
                .with_setter(set_loop),
            Property::new("loopStart")?
                .with_getter(get_loop_start)
                .with_setter(set_loop_start),
            Property::new("loopEnd")?
                .with_getter(get_loop_end)
                .with_setter(set_loop_end),
            Property::new("start")?.with_method(start),
            Property::new("stop")?.with_method(stop),
            Property::new("clear_ended_callback")?.with_method(clear_ended_callback)
        ];

        env.define_class("AudioBufferSourceNode", constructor, &interface)
    }

    // @note: this is used in audio_node.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut AudioBufferSourceNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse AudioBufferSourceOptions
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

    let buffer_js = js_options.get::<&str, JsUnknown>("buffer")?.unwrap();
    let buffer = match buffer_js.get_type()? {
        ValueType::Object => {
            let buffer_js = buffer_js.coerce_to_object()?;
            let buffer_napi = ctx.env.unwrap::<NapiAudioBuffer>(&buffer_js)?;
            Some(buffer_napi.unwrap().clone())
        }
        ValueType::Null => None,
        _ => unreachable!(),
    };

    let detune = js_options
        .get::<&str, JsNumber>("detune")?
        .unwrap()
        .get_double()? as f32;

    let loop_ = js_options
        .get::<&str, JsBoolean>("loop")?
        .unwrap()
        .try_into()?;

    let loop_end = js_options
        .get::<&str, JsNumber>("loopEnd")?
        .unwrap()
        .get_double()?;

    let loop_start = js_options
        .get::<&str, JsNumber>("loopStart")?
        .unwrap()
        .get_double()?;

    let playback_rate = js_options
        .get::<&str, JsNumber>("playbackRate")?
        .unwrap()
        .get_double()? as f32;

    // --------------------------------------------------------
    // Create AudioBufferSourceOptions object
    // --------------------------------------------------------
    let options = AudioBufferSourceOptions {
        buffer,
        detune,
        loop_,
        loop_end,
        loop_start,
        playback_rate,
    };

    // --------------------------------------------------------
    // Create native AudioBufferSourceNode
    // --------------------------------------------------------
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
        &_ => unreachable!(),
    };

    // --------------------------------------------------------
    // Bind AudioParam to JS object
    // --------------------------------------------------------

    let native_param = native_node.playback_rate().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("playbackRate", &js_obj)?;

    let native_param = native_node.detune().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("detune", &js_obj)?;

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioBufferSourceNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiAudioBufferSourceNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiAudioBufferSourceNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
fn listen_to_ended_event(
    env: &Env,
    js_this: &JsObject,
    node: &mut AudioBufferSourceNode,
) -> Result<()> {
    use std::sync::{Arc, Mutex};

    use napi::threadsafe_function::{ThreadSafeCallContext, ThreadsafeFunctionCallMode};
    use web_audio_api::Event;

    let k_onended = get_symbol_for(env, "node-web-audio-api:onended");
    let ended_cb = js_this.get_property(k_onended).unwrap();
    let mut ended_tsfn =
        env.create_threadsafe_function(&ended_cb, 0, |ctx: ThreadSafeCallContext<Event>| {
            let mut event = ctx.env.create_object()?;
            let event_type = ctx.env.create_string(ctx.value.type_)?;
            event.set_named_property("type", event_type)?;

            Ok(vec![event])
        })?;

    // unref tsfn so they do not prevent the process to exit
    // let _ = ended_tsfn.unref(env);
    let ended_tsfn_mutex = Arc::new(Mutex::new(ended_tsfn.clone()));

    node.set_onended(move |e| {
        ended_tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
        // even with unref, if the tsfn is not aborted, the node cannot
        // be garbage collected
        std::thread::sleep(std::time::Duration::from_micros(100));
        let ended_tsfn = ended_tsfn_mutex.lock().unwrap();
        let _ = ended_tsfn.clone().abort();
    });

    Ok(())
}

#[js_function]
fn clear_ended_callback(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    // node.clear_onended();

    ctx.env.get_undefined()
}

#[js_function(3)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    listen_to_ended_event(ctx.env, &js_this, node)?;

    let when = ctx.get::<JsNumber>(0)?.get_double()?;

    let offset_js = ctx.get::<JsUnknown>(1)?;
    let offset = match offset_js.get_type()? {
        ValueType::Number => offset_js.coerce_to_number()?.get_double()?,
        ValueType::Null => 0.,
        _ => unreachable!(),
    };

    let duration_js = ctx.get::<JsUnknown>(2)?;
    let duration = match duration_js.get_type()? {
        ValueType::Number => duration_js.coerce_to_number()?.get_double()?,
        ValueType::Null => f64::MAX,
        _ => unreachable!(),
    };

    node.start_at_with_offset_and_duration(when, offset, duration);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let when = ctx.get::<JsNumber>(0)?.get_double()?;
    node.stop_at(when);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// Getters / Setters
// -------------------------------------------------

#[js_function(0)]
fn get_buffer(_ctx: CallContext) -> Result<JsUnknown> {
    unreachable!();
}

#[js_function(1)]
fn set_buffer(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_buffer(obj.clone());

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_loop(ctx: CallContext) -> Result<JsBoolean> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_();
    ctx.env.get_boolean(value)
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

#[js_function(0)]
fn get_loop_start(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_start();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_loop_start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_loop_start(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_loop_end(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.loop_end();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_loop_end(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioBufferSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_loop_end(value);

    ctx.env.get_undefined()
}
