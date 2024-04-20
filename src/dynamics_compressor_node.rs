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

pub(crate) struct NapiDynamicsCompressorNode(DynamicsCompressorNode);

// for debug purpose
impl Drop for NapiDynamicsCompressorNode {
    fn drop(&mut self) {
        println!("NAPI: NapiDynamicsCompressorNode dropped");
    }
}

impl NapiDynamicsCompressorNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface =
            audio_node_interface![Property::new("reduction")?.with_getter(get_reduction)];

        env.define_class("DynamicsCompressorNode", constructor, &interface)
    }

    // @note: this is used in audio_node.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut DynamicsCompressorNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse DynamicsCompressorOptions
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

    let attack = js_options
        .get::<&str, JsNumber>("attack")?
        .unwrap()
        .get_double()? as f32;

    let knee = js_options
        .get::<&str, JsNumber>("knee")?
        .unwrap()
        .get_double()? as f32;

    let ratio = js_options
        .get::<&str, JsNumber>("ratio")?
        .unwrap()
        .get_double()? as f32;

    let release = js_options
        .get::<&str, JsNumber>("release")?
        .unwrap()
        .get_double()? as f32;

    let threshold = js_options
        .get::<&str, JsNumber>("threshold")?
        .unwrap()
        .get_double()? as f32;

    // --------------------------------------------------------
    // Parse AudioNodeOptions
    // --------------------------------------------------------
    let node_defaults = DynamicsCompressorOptions::default();
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
    // Create DynamicsCompressorOptions object
    // --------------------------------------------------------
    let options = DynamicsCompressorOptions {
        attack,
        knee,
        ratio,
        release,
        threshold,
        audio_node_options: AudioNodeOptions {
            channel_count,
            channel_count_mode,
            channel_interpretation,
        },
    };

    // --------------------------------------------------------
    // Create native DynamicsCompressorNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            DynamicsCompressorNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            DynamicsCompressorNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    // --------------------------------------------------------
    // Bind AudioParam to JS object
    // --------------------------------------------------------
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioParam")?;

    let native_param = native_node.threshold().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("threshold", &js_obj)?;

    let native_param = native_node.knee().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("knee", &js_obj)?;

    let native_param = native_node.ratio().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("ratio", &js_obj)?;

    let native_param = native_node.attack().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("attack", &js_obj)?;

    let native_param = native_node.release().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("release", &js_obj)?;

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("DynamicsCompressorNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiDynamicsCompressorNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiDynamicsCompressorNode);

// -------------------------------------------------
// Getters / Setters
// -------------------------------------------------

#[js_function(0)]
fn get_reduction(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.reduction();
    ctx.env.create_double(value as f64)
}
