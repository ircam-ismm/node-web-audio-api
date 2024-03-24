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

pub(crate) struct NapiAnalyserNode(AnalyserNode);

// for debug purpose
// impl Drop for NapiAnalyserNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiAnalyserNode dropped");
//     }
// }

impl NapiAnalyserNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AnalyserNode",
            constructor,
            &[
                // Attributes
                Property::new("fftSize")?
                    .with_getter(get_fft_size)
                    .with_setter(set_fft_size)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("frequencyBinCount")?
                    .with_getter(get_frequency_bin_count)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("minDecibels")?
                    .with_getter(get_min_decibels)
                    .with_setter(set_min_decibels)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("maxDecibels")?
                    .with_getter(get_max_decibels)
                    .with_setter(set_max_decibels)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("smoothingTimeConstant")?
                    .with_getter(get_smoothing_time_constant)
                    .with_setter(set_smoothing_time_constant)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Methods
                Property::new("getFloatFrequencyData")?
                    .with_method(get_float_frequency_data)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("getByteFrequencyData")?
                    .with_method(get_byte_frequency_data)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("getFloatTimeDomainData")?
                    .with_method(get_float_time_domain_data)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("getByteTimeDomainData")?
                    .with_method(get_byte_time_domain_data)
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
    pub fn unwrap(&mut self) -> &mut AnalyserNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // parse options
    let js_options = ctx.get::<JsObject>(1)?;

    let fft_size = js_options
        .get::<&str, JsNumber>("fftSize")?
        .unwrap()
        .get_double()? as usize;

    let max_decibels = js_options
        .get::<&str, JsNumber>("maxDecibels")?
        .unwrap()
        .get_double()?;

    let min_decibels = js_options
        .get::<&str, JsNumber>("minDecibels")?
        .unwrap()
        .get_double()?;

    let smoothing_time_constant = js_options
        .get::<&str, JsNumber>("smoothingTimeConstant")?
        .unwrap()
        .get_double()?;

    let node_defaults = AnalyserOptions::default();
    let channel_config_defaults = node_defaults.channel_config;

    let some_channel_count_js = js_options.get::<&str, JsObject>("channelCount")?;
    let channel_count = if let Some(channel_count_js) = some_channel_count_js {
        channel_count_js.coerce_to_number()?.get_double()? as usize
    } else {
        channel_config_defaults.count
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
        channel_config_defaults.count_mode
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
        channel_config_defaults.interpretation
    };

    let options = AnalyserOptions {
        fft_size,
        max_decibels,
        min_decibels,
        smoothing_time_constant,
        channel_config: ChannelConfigOptions {
            count: channel_count,
            count_mode: channel_count_mode,
            interpretation: channel_interpretation,
        },
    };

    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    // create native node
    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            AnalyserNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            AnalyserNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AnalyserNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiAnalyserNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_inputs = node.number_of_inputs() as f64;

    ctx.env.create_double(number_of_inputs)
}

#[js_function]
fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_outputs = node.number_of_outputs() as f64;

    ctx.env.create_double(number_of_outputs)
}

// -------------------------------------------------
// connect / disconnect macros
// -------------------------------------------------
connect_method!(NapiAnalyserNode);
disconnect_method!(NapiAnalyserNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_fft_size(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.fft_size();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_frequency_bin_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.frequency_bin_count();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_min_decibels(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.min_decibels();
    ctx.env.create_double(value)
}

#[js_function(0)]
fn get_max_decibels(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.max_decibels();
    ctx.env.create_double(value)
}

#[js_function(0)]
fn get_smoothing_time_constant(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.smoothing_time_constant();
    ctx.env.create_double(value)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_fft_size(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()? as usize;
    node.set_fft_size(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_min_decibels(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    node.set_min_decibels(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_max_decibels(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    node.set_max_decibels(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_smoothing_time_constant(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    node.set_smoothing_time_constant(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(1)]
fn get_float_frequency_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let mut array_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let array: &mut [f32] = array_js.as_mut();

    node.get_float_frequency_data(array);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn get_byte_frequency_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let mut array_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let array: &mut [u8] = array_js.as_mut();

    node.get_byte_frequency_data(array);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn get_float_time_domain_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let mut array_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let array: &mut [f32] = array_js.as_mut();

    node.get_float_time_domain_data(array);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn get_byte_time_domain_data(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAnalyserNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let mut array_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let array: &mut [u8] = array_js.as_mut();

    node.get_byte_time_domain_data(array);

    ctx.env.get_undefined()
}
