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

pub(crate) struct NapiConstantSourceNode(ConstantSourceNode);

// for debug purpose
// impl Drop for NapiConstantSourceNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiConstantSourceNode dropped");
//     }
// }

impl NapiConstantSourceNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "ConstantSourceNode",
            constructor,
            &[
                // Attributes

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
    pub fn unwrap(&mut self) -> &mut ConstantSourceNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // parse options
    let js_options = ctx.get::<JsObject>(1)?;

    let offset = js_options
        .get::<&str, JsNumber>("offset")?
        .unwrap()
        .get_double()? as f32;

    let options = ConstantSourceOptions { offset };

    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    // create native node
    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ConstantSourceNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ConstantSourceNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    let native_param = native_node.offset().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("offset", &js_obj)?;

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("ConstantSourceNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiConstantSourceNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_inputs = node.number_of_inputs() as f64;

    ctx.env.create_double(number_of_inputs)
}

#[js_function]
fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_outputs = node.number_of_outputs() as f64;

    ctx.env.create_double(number_of_outputs)
}

// -------------------------------------------------
// connect / disconnect macros
// -------------------------------------------------
connect_method!(NapiConstantSourceNode);
disconnect_method!(NapiConstantSourceNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------

#[js_function(1)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    match ctx.length {
        0 => node.start(),
        1 => {
            let when = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
            node.start_at(when);
        }
        _ => (),
    }

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
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

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

// -------------------------------------------------
// METHODS
// -------------------------------------------------
