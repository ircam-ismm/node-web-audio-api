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

pub(crate) struct NapiWaveShaperNode(WaveShaperNode);

// for debug purpose
// impl Drop for NapiWaveShaperNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiWaveShaperNode dropped");
//     }
// }

impl NapiWaveShaperNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "WaveShaperNode",
            constructor,
            &[
                // Attributes
                Property::new("curve")?
                    .with_getter(get_curve)
                    .with_setter(set_curve)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("oversample")?
                    .with_getter(get_oversample)
                    .with_setter(set_oversample)
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
            ],
        )
    }

    // @note: this is also used in audio_node.tmpl.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut WaveShaperNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // parse options
    let js_options = ctx.get::<JsObject>(1)?;

    let curve_js = js_options.get::<&str, JsUnknown>("curve")?.unwrap();
    let curve = if curve_js.get_type()? == ValueType::Null {
        None
    } else {
        let curve_js = js_options.get::<&str, JsTypedArray>("curve")?.unwrap();
        let curve_value = curve_js.into_value()?;
        let curve: &[f32] = curve_value.as_ref();
        Some(curve.to_vec())
    };

    let oversample_js = js_options.get::<&str, JsString>("oversample")?.unwrap();
    let oversample_str = oversample_js.into_utf8()?.into_owned()?;
    let oversample = match oversample_str.as_str() {
        "none" => OverSampleType::None,
        "2x" => OverSampleType::X2,
        "4x" => OverSampleType::X4,
        _ => unreachable!(),
    };

    let node_defaults = WaveShaperOptions::default();
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

    let options = WaveShaperOptions {
        curve,
        oversample,
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
            WaveShaperNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            WaveShaperNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("WaveShaperNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiWaveShaperNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_inputs = node.number_of_inputs() as f64;

    ctx.env.create_double(number_of_inputs)
}

#[js_function]
fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_outputs = node.number_of_outputs() as f64;

    ctx.env.create_double(number_of_outputs)
}

// -------------------------------------------------
// connect / disconnect macros
// -------------------------------------------------
connect_method!(NapiWaveShaperNode);
disconnect_method!(NapiWaveShaperNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_curve(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();

    if js_this.has_named_property("__curve__")? {
        Ok(js_this
            .get_named_property::<JsObject>("__curve__")?
            .into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}

#[js_function(0)]
fn get_oversample(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.oversample();
    let js_value = match value {
        OverSampleType::None => "none",
        OverSampleType::X2 => "2x",
        OverSampleType::X4 => "4x",
    };

    ctx.env.create_string(js_value)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_curve(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsTypedArray>(0)?;
    let buffer = js_obj.into_value()?;
    let buffer_ref: &[f32] = buffer.as_ref();
    // @todo - remove this vec![]
    node.set_curve(buffer_ref.to_vec());
    // weird but seems we can have twice the same owned value...
    let js_obj = ctx.get::<JsTypedArray>(0)?;
    // store in "private" field for getter (not very clean, to review)
    js_this.set_named_property("__curve__", js_obj)?;

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_oversample(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsObject>(0)?.coerce_to_string()?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "none" => OverSampleType::None,
        "2x" => OverSampleType::X2,
        "4x" => OverSampleType::X4,
        _ => return ctx.env.get_undefined(),
    };

    node.set_oversample(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------
