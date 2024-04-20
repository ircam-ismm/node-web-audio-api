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

pub(crate) struct NapiConvolverNode(ConvolverNode);

// for debug purpose
// impl Drop for NapiConvolverNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiConvolverNode dropped");
//     }
// }

impl NapiConvolverNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("buffer")?
                .with_getter(get_buffer)
                .with_setter(set_buffer),
            Property::new("normalize")?
                .with_getter(get_normalize)
                .with_setter(set_normalize)
        ];

        env.define_class("ConvolverNode", constructor, &interface)
    }

    // @note: this is used in audio_node.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut ConvolverNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse ConvolverOptions
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

    let disable_normalization = js_options
        .get::<&str, JsBoolean>("disableNormalization")?
        .unwrap()
        .try_into()?;

    // --------------------------------------------------------
    // Parse AudioNodeOptions
    // --------------------------------------------------------
    let node_defaults = ConvolverOptions::default();
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
    // Create ConvolverOptions object
    // --------------------------------------------------------
    let options = ConvolverOptions {
        buffer,
        disable_normalization,
        audio_node_options: AudioNodeOptions {
            channel_count,
            channel_count_mode,
            channel_interpretation,
        },
    };

    // --------------------------------------------------------
    // Create native ConvolverNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ConvolverNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ConvolverNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("ConvolverNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiConvolverNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiConvolverNode);

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
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_buffer(obj.clone());

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_normalize(ctx: CallContext) -> Result<JsBoolean> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.normalize();
    ctx.env.get_boolean(value)
}

#[js_function(1)]
fn set_normalize(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsBoolean>(0)?.try_into()?;
    node.set_normalize(value);

    ctx.env.get_undefined()
}
