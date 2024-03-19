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

pub(crate) struct NapiBiquadFilterNode(BiquadFilterNode);

// for debug purpose
// impl Drop for NapiBiquadFilterNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiBiquadFilterNode dropped");
//     }
// }

impl NapiBiquadFilterNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "BiquadFilterNode",
            constructor,
            &[
                // Attributes
                Property::new("type")?
                    .with_getter(get_type)
                    .with_setter(set_type)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Methods
                Property::new("getFrequencyResponse")?
                    .with_method(get_frequency_response)
                    .with_property_attributes(PropertyAttributes::Enumerable),
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
            ],
        )
    }

    // @note: this is also used in audio_node.tmpl.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut BiquadFilterNode {
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
    //             let msg = "TypeError - Failed to construct 'BiquadFilterNode': argument 1 is not of type BaseAudioContext";
    //             return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    //         }

    //         audio_context_utf8_name
    //     } else {
    //         let msg = "TypeError - Failed to construct 'BiquadFilterNode': argument 1 is not of type BaseAudioContext";
    //         return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    //     }
    // } else {
    //     // This swallowed somehow, .e.g const node = new GainNode(null); throws
    //     // TypeError Cannot convert undefined or null to object
    //     // To be investigated...
    //     let msg = "TypeError - Failed to construct 'BiquadFilterNode': argument 1 is not of type BaseAudioContext";
    //     return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    // };

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("BiquadFilterNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // parse options
    let options = if let Ok(either_options) = ctx.try_get::<JsObject>(1) {
        match either_options {
            Either::A(options_js) => {
                let some_type_js = options_js.get::<&str, JsString>("type")?;
                let type_ = if let Some(type_js) = some_type_js {
                    let type_str = type_js.into_utf8()?.into_owned()?;

                    match type_str.as_str() {
                        "lowpass" => BiquadFilterType::Lowpass,
                        "highpass" => BiquadFilterType::Highpass,
                        "bandpass" => BiquadFilterType::Bandpass,
                        "lowshelf" => BiquadFilterType::Lowshelf,
                        "highshelf" => BiquadFilterType::Highshelf,
                        "peaking" => BiquadFilterType::Peaking,
                        "notch" => BiquadFilterType::Notch,
                        "allpass" => BiquadFilterType::Allpass,
                        _ => panic!("undefined value for BiquadFilterType"),
                    }
                } else {
                    BiquadFilterType::default()
                };

                let some_q_js = options_js.get::<&str, JsObject>("Q")?;
                let q = if let Some(q_js) = some_q_js {
                    q_js.coerce_to_number()?.get_double()? as f32
                } else {
                    1.
                };

                let some_detune_js = options_js.get::<&str, JsObject>("detune")?;
                let detune = if let Some(detune_js) = some_detune_js {
                    detune_js.coerce_to_number()?.get_double()? as f32
                } else {
                    0.
                };

                let some_frequency_js = options_js.get::<&str, JsObject>("frequency")?;
                let frequency = if let Some(frequency_js) = some_frequency_js {
                    frequency_js.coerce_to_number()?.get_double()? as f32
                } else {
                    350.
                };

                let some_gain_js = options_js.get::<&str, JsObject>("gain")?;
                let gain = if let Some(gain_js) = some_gain_js {
                    gain_js.coerce_to_number()?.get_double()? as f32
                } else {
                    0.
                };

                let node_defaults = BiquadFilterOptions::default();
                let channel_config_defaults = node_defaults.channel_config;

                let some_channel_count_js = options_js.get::<&str, JsObject>("channelCount")?;
                let channel_count = if let Some(channel_count_js) = some_channel_count_js {
                    channel_count_js.coerce_to_number()?.get_double()? as usize
                } else {
                    channel_config_defaults.count
                };

                let some_channel_count_mode_js =
                    options_js.get::<&str, JsObject>("channelCountMode")?;
                let channel_count_mode = if let Some(channel_count_mode_js) =
                    some_channel_count_mode_js
                {
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
                    channel_config_defaults.count_mode
                };

                let some_channel_interpretation_js =
                    options_js.get::<&str, JsObject>("channelInterpretation")?;
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
                    channel_config_defaults.interpretation
                };

                BiquadFilterOptions {
                    type_,
                    q,
                    detune,
                    frequency,
                    gain,
                    channel_config: ChannelConfigOptions {
                        count: channel_count,
                        count_mode: channel_count_mode,
                        interpretation: channel_interpretation,
                    },
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
            BiquadFilterNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            BiquadFilterNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    // AudioParam: BiquadFilterNode::frequency
    let native_param = native_node.frequency().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("frequency", &js_obj)?;

    // AudioParam: BiquadFilterNode::detune
    let native_param = native_node.detune().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("detune", &js_obj)?;

    // AudioParam: BiquadFilterNode::Q
    let native_param = native_node.q().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("Q", &js_obj)?;

    // AudioParam: BiquadFilterNode::gain
    let native_param = native_node.gain().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("gain", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiBiquadFilterNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_inputs = node.number_of_inputs() as f64;

    ctx.env.create_double(number_of_inputs)
}

#[js_function]
fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_outputs = node.number_of_outputs() as f64;

    ctx.env.create_double(number_of_outputs)
}

// -------------------------------------------------
// connect / disconnect macros
// -------------------------------------------------
connect_method!(NapiBiquadFilterNode);
disconnect_method!(NapiBiquadFilterNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_type(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.type_();
    let js_value = match value {
        BiquadFilterType::Lowpass => "lowpass",
        BiquadFilterType::Highpass => "highpass",
        BiquadFilterType::Bandpass => "bandpass",
        BiquadFilterType::Lowshelf => "lowshelf",
        BiquadFilterType::Highshelf => "highshelf",
        BiquadFilterType::Peaking => "peaking",
        BiquadFilterType::Notch => "notch",
        BiquadFilterType::Allpass => "allpass",
    };

    ctx.env.create_string(js_value)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_type(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsObject>(0)?.coerce_to_string()?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "lowpass" => BiquadFilterType::Lowpass,
        "highpass" => BiquadFilterType::Highpass,
        "bandpass" => BiquadFilterType::Bandpass,
        "lowshelf" => BiquadFilterType::Lowshelf,
        "highshelf" => BiquadFilterType::Highshelf,
        "peaking" => BiquadFilterType::Peaking,
        "notch" => BiquadFilterType::Notch,
        "allpass" => BiquadFilterType::Allpass,
        _ => return ctx.env.get_undefined(),
    };

    node.set_type(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(3)]
fn get_frequency_response(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let mut frequency_hz_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let frequency_hz: &mut [f32] = frequency_hz_js.as_mut();

    let mut mag_response_js = ctx.get::<JsTypedArray>(1)?.into_value()?;
    let mag_response: &mut [f32] = mag_response_js.as_mut();

    let mut phase_response_js = ctx.get::<JsTypedArray>(2)?.into_value()?;
    let phase_response: &mut [f32] = phase_response_js.as_mut();

    node.get_frequency_response(frequency_hz, mag_response, phase_response);

    ctx.env.get_undefined()
}
