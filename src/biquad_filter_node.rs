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

pub(crate) struct NapiBiquadFilterNode(BiquadFilterNode);

// for debug purpose
// impl Drop for NapiBiquadFilterNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiBiquadFilterNode dropped");
//     }
// }

impl NapiBiquadFilterNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("type")?
                .with_getter(get_type)
                .with_setter(set_type),
            Property::new("getFrequencyResponse")?.with_method(get_frequency_response)
        ];

        env.define_class("BiquadFilterNode", constructor, &interface)
    }

    // @note: this is also used in audio_node.tmpl.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut BiquadFilterNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse BiquadFilterOptions
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

    let type_js = js_options.get::<&str, JsString>("type")?.unwrap();
    let type_str = type_js.into_utf8()?.into_owned()?;
    let type_ = match type_str.as_str() {
        "lowpass" => BiquadFilterType::Lowpass,
        "highpass" => BiquadFilterType::Highpass,
        "bandpass" => BiquadFilterType::Bandpass,
        "lowshelf" => BiquadFilterType::Lowshelf,
        "highshelf" => BiquadFilterType::Highshelf,
        "peaking" => BiquadFilterType::Peaking,
        "notch" => BiquadFilterType::Notch,
        "allpass" => BiquadFilterType::Allpass,
        _ => unreachable!(),
    };

    let q = js_options
        .get::<&str, JsNumber>("Q")?
        .unwrap()
        .get_double()? as f32;

    let detune = js_options
        .get::<&str, JsNumber>("detune")?
        .unwrap()
        .get_double()? as f32;

    let frequency = js_options
        .get::<&str, JsNumber>("frequency")?
        .unwrap()
        .get_double()? as f32;

    let gain = js_options
        .get::<&str, JsNumber>("gain")?
        .unwrap()
        .get_double()? as f32;

    // --------------------------------------------------------
    // Parse AudioNodeOptions
    // --------------------------------------------------------
    let node_defaults = BiquadFilterOptions::default();
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
    // Create BiquadFilterOptions object
    // --------------------------------------------------------
    let options = BiquadFilterOptions {
        type_,
        q,
        detune,
        frequency,
        gain,
        audio_node_options: AudioNodeOptions {
            channel_count,
            channel_count_mode,
            channel_interpretation,
        },
    };

    // --------------------------------------------------------
    // Create native BiquadFilterNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

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

    let native_param = native_node.q().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("Q", &js_obj)?;

    let native_param = native_node.gain().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("gain", &js_obj)?;

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("BiquadFilterNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiBiquadFilterNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiBiquadFilterNode);

// -------------------------------------------------
// Getters / Setters
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
        _ => unreachable!(),
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
