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

use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;

use crate::*;

pub(crate) struct NapiOscillatorNode(OscillatorNode);

// for debug purpose
// impl Drop for NapiOscillatorNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiOscillatorNode dropped");
//     }
// }

impl NapiOscillatorNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("type")?
                .with_getter(get_type)
                .with_setter(set_type),
            Property::new("setPeriodicWave")?.with_method(set_periodic_wave),
            Property::new("start")?.with_method(start),
            Property::new("stop")?.with_method(stop),
            Property::new("__initEventTarget__")?.with_method(init_event_target)
        ];

        env.define_class("OscillatorNode", constructor, &interface)
    }

    // @note: this is also used in audio_node.tmpl.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut OscillatorNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse OscillatorOptions
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

    let type_js = js_options.get::<&str, JsString>("type")?.unwrap();
    let type_str = type_js.into_utf8()?.into_owned()?;
    let type_ = match type_str.as_str() {
        "sine" => OscillatorType::Sine,
        "square" => OscillatorType::Square,
        "sawtooth" => OscillatorType::Sawtooth,
        "triangle" => OscillatorType::Triangle,
        "custom" => OscillatorType::Custom,
        _ => unreachable!(),
    };

    let frequency = js_options
        .get::<&str, JsNumber>("frequency")?
        .unwrap()
        .get_double()? as f32;

    let detune = js_options
        .get::<&str, JsNumber>("detune")?
        .unwrap()
        .get_double()? as f32;

    let periodic_wave_js = js_options.get::<&str, JsUnknown>("periodicWave")?.unwrap();
    let periodic_wave = match periodic_wave_js.get_type()? {
        ValueType::Object => {
            let periodic_wave_js = periodic_wave_js.coerce_to_object()?;
            let periodic_wave_napi = ctx.env.unwrap::<NapiPeriodicWave>(&periodic_wave_js)?;
            Some(periodic_wave_napi.unwrap().clone())
        }
        ValueType::Null => None,
        _ => unreachable!(),
    };

    // --------------------------------------------------------
    // Parse AudioNodeOptions
    // --------------------------------------------------------
    let node_defaults = OscillatorOptions::default();
    let audio_node_options_default = node_defaults.audio_node_options;

    let some_channel_count_js = js_options.get::<&str, JsObject>("channelCount")?;
    let channel_count = if let Some(channel_count_js) = some_channel_count_js {
        channel_count_js.coerce_to_number()?.get_double()? as usize
    } else {
        audio_node_options_default.channel_count
    };

    let some_channel_count_mode_js = js_options.get::<&str, JsObject>("channelCountMode")?;
    let channel_count_mode = if let Some(channel_count_mode_js) = some_channel_count_mode_js {
        let channel_count_mode_str = channel_count_mode_js
            .coerce_to_string()?
            .into_utf8()?
            .into_owned()?;

        match channel_count_mode_str.as_str() {
            "max" => ChannelCountMode::Max,
            "clamped-max" => ChannelCountMode::ClampedMax,
            "explicit" => ChannelCountMode::Explicit,
            _ => panic!("TypeError - Failed to read the 'channelCountMode' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelCountMode", channel_count_mode_str.as_str()),
        }
    } else {
        audio_node_options_default.channel_count_mode
    };

    let some_channel_interpretation_js =
        js_options.get::<&str, JsObject>("channelInterpretation")?;
    let channel_interpretation = if let Some(channel_interpretation_js) =
        some_channel_interpretation_js
    {
        let channel_interpretation_str = channel_interpretation_js
            .coerce_to_string()?
            .into_utf8()?
            .into_owned()?;

        match channel_interpretation_str.as_str() {
            "speakers" => ChannelInterpretation::Speakers,
            "discrete" => ChannelInterpretation::Discrete,
            _ => panic!("TypeError - Failed to read the 'channelInterpretation' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", channel_interpretation_str.as_str()),
        }
    } else {
        audio_node_options_default.channel_interpretation
    };

    // --------------------------------------------------------
    // Create OscillatorOptions object
    // --------------------------------------------------------
    let options = OscillatorOptions {
        type_,
        frequency,
        detune,
        periodic_wave,
        audio_node_options: AudioNodeOptions {
            channel_count,
            channel_count_mode,
            channel_interpretation,
        },
    };

    // --------------------------------------------------------
    // Create native OscillatorNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            OscillatorNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            OscillatorNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    // --------------------------------------------------------
    // Bind AudioParam to JS object
    // --------------------------------------------------------
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioParam")?;

    let native_param = native_node.frequency().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("frequency", &js_obj)?;

    let native_param = native_node.detune().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
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
            .with_value(&ctx.env.create_string("OscillatorNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiOscillatorNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiOscillatorNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
#[js_function(1)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let when = ctx.get::<JsNumber>(0)?.get_double()?;
    node.start_at(when);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let when = ctx.get::<JsNumber>(0)?.get_double()?;
    node.stop_at(when);

    ctx.env.get_undefined()
}

// ----------------------------------------------------
// EventTarget initialization - cf. js/utils/events.js
// ----------------------------------------------------
#[js_function]
fn init_event_target(ctx: CallContext) -> Result<JsUndefined> {
    use crate::utils::WebAudioEventType;
    use napi::threadsafe_function::{ThreadSafeCallContext, ThreadsafeFunctionCallMode};
    use web_audio_api::Event;

    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
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

    let tsfn = ctx.env.create_threadsafe_function(
        &js_func,
        0,
        |ctx: ThreadSafeCallContext<WebAudioEventType>| {
            let native_event = ctx.value.unwrap_event();
            let event_type = ctx.env.create_string(native_event.type_)?;
            Ok(vec![event_type])
        },
    )?;

    match audio_context_str {
        "AudioContext" => {
            let napi_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let store_id = napi_context.tsfn_store().add(tsfn.clone());
            let napi_context = napi_context.clone();

            node.set_onended(move |e: Event| {
                let event = WebAudioEventType::from(e);
                tsfn.call(Ok(event), ThreadsafeFunctionCallMode::NonBlocking);
                napi_context.tsfn_store().delete(store_id);
            });
        }
        "OfflineAudioContext" => {
            let napi_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let store_id = napi_context.tsfn_store().add(tsfn.clone());
            let napi_context = napi_context.clone();

            node.set_onended(move |e: Event| {
                let event = WebAudioEventType::from(e);
                tsfn.call(Ok(event), ThreadsafeFunctionCallMode::NonBlocking);
                napi_context.tsfn_store().delete(store_id);
            });
        }
        &_ => unreachable!(),
    };

    ctx.env.get_undefined()
}

// -------------------------------------------------
// Getters / Setters
// -------------------------------------------------

#[js_function(0)]
fn get_type(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.type_();
    let js_value = match value {
        OscillatorType::Sine => "sine",
        OscillatorType::Square => "square",
        OscillatorType::Sawtooth => "sawtooth",
        OscillatorType::Triangle => "triangle",
        OscillatorType::Custom => "custom",
    };

    ctx.env.create_string(js_value)
}

#[js_function(1)]
fn set_type(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsObject>(0)?.coerce_to_string()?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "sine" => OscillatorType::Sine,
        "square" => OscillatorType::Square,
        "sawtooth" => OscillatorType::Sawtooth,
        "triangle" => OscillatorType::Triangle,
        "custom" => OscillatorType::Custom,
        _ => unreachable!(),
    };

    node.set_type(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(1)]
fn set_periodic_wave(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let periodic_wave_js = ctx.get::<JsObject>(0)?;
    let periodic_wave_napi = ctx.env.unwrap::<NapiPeriodicWave>(&periodic_wave_js)?;
    let periodic_wave = periodic_wave_napi.unwrap().clone();

    node.set_periodic_wave(periodic_wave);

    ctx.env.get_undefined()
}
