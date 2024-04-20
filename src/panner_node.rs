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

pub(crate) struct NapiPannerNode(PannerNode);

// for debug purpose
impl Drop for NapiPannerNode {
    fn drop(&mut self) {
        println!("NAPI: NapiPannerNode dropped");
    }
}

impl NapiPannerNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("panningModel")?
                .with_getter(get_panning_model)
                .with_setter(set_panning_model),
            Property::new("distanceModel")?
                .with_getter(get_distance_model)
                .with_setter(set_distance_model),
            Property::new("refDistance")?
                .with_getter(get_ref_distance)
                .with_setter(set_ref_distance),
            Property::new("maxDistance")?
                .with_getter(get_max_distance)
                .with_setter(set_max_distance),
            Property::new("rolloffFactor")?
                .with_getter(get_rolloff_factor)
                .with_setter(set_rolloff_factor),
            Property::new("coneInnerAngle")?
                .with_getter(get_cone_inner_angle)
                .with_setter(set_cone_inner_angle),
            Property::new("coneOuterAngle")?
                .with_getter(get_cone_outer_angle)
                .with_setter(set_cone_outer_angle),
            Property::new("coneOuterGain")?
                .with_getter(get_cone_outer_gain)
                .with_setter(set_cone_outer_gain),
            Property::new("setPosition")?.with_method(set_position),
            Property::new("setOrientation")?.with_method(set_orientation)
        ];

        env.define_class("PannerNode", constructor, &interface)
    }

    // @note: this is used in audio_node.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut PannerNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse PannerOptions
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

    let panning_model_js = js_options.get::<&str, JsString>("panningModel")?.unwrap();
    let panning_model_str = panning_model_js.into_utf8()?.into_owned()?;
    let panning_model = match panning_model_str.as_str() {
        "equalpower" => PanningModelType::EqualPower,
        "HRTF" => PanningModelType::HRTF,
        _ => unreachable!(),
    };

    let distance_model_js = js_options.get::<&str, JsString>("distanceModel")?.unwrap();
    let distance_model_str = distance_model_js.into_utf8()?.into_owned()?;
    let distance_model = match distance_model_str.as_str() {
        "linear" => DistanceModelType::Linear,
        "inverse" => DistanceModelType::Inverse,
        "exponential" => DistanceModelType::Exponential,
        _ => unreachable!(),
    };

    let position_x = js_options
        .get::<&str, JsNumber>("positionX")?
        .unwrap()
        .get_double()? as f32;

    let position_y = js_options
        .get::<&str, JsNumber>("positionY")?
        .unwrap()
        .get_double()? as f32;

    let position_z = js_options
        .get::<&str, JsNumber>("positionZ")?
        .unwrap()
        .get_double()? as f32;

    let orientation_x = js_options
        .get::<&str, JsNumber>("orientationX")?
        .unwrap()
        .get_double()? as f32;

    let orientation_y = js_options
        .get::<&str, JsNumber>("orientationY")?
        .unwrap()
        .get_double()? as f32;

    let orientation_z = js_options
        .get::<&str, JsNumber>("orientationZ")?
        .unwrap()
        .get_double()? as f32;

    let ref_distance = js_options
        .get::<&str, JsNumber>("refDistance")?
        .unwrap()
        .get_double()?;

    let max_distance = js_options
        .get::<&str, JsNumber>("maxDistance")?
        .unwrap()
        .get_double()?;

    let rolloff_factor = js_options
        .get::<&str, JsNumber>("rolloffFactor")?
        .unwrap()
        .get_double()?;

    let cone_inner_angle = js_options
        .get::<&str, JsNumber>("coneInnerAngle")?
        .unwrap()
        .get_double()?;

    let cone_outer_angle = js_options
        .get::<&str, JsNumber>("coneOuterAngle")?
        .unwrap()
        .get_double()?;

    let cone_outer_gain = js_options
        .get::<&str, JsNumber>("coneOuterGain")?
        .unwrap()
        .get_double()?;

    // --------------------------------------------------------
    // Parse AudioNodeOptions
    // --------------------------------------------------------
    let node_defaults = PannerOptions::default();
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
    // Create PannerOptions object
    // --------------------------------------------------------
    let options = PannerOptions {
        panning_model,
        distance_model,
        position_x,
        position_y,
        position_z,
        orientation_x,
        orientation_y,
        orientation_z,
        ref_distance,
        max_distance,
        rolloff_factor,
        cone_inner_angle,
        cone_outer_angle,
        cone_outer_gain,
        audio_node_options: AudioNodeOptions {
            channel_count,
            channel_count_mode,
            channel_interpretation,
        },
    };

    // --------------------------------------------------------
    // Create native PannerNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            PannerNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            PannerNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    // --------------------------------------------------------
    // Bind AudioParam to JS object
    // --------------------------------------------------------

    let native_param = native_node.position_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionX", &js_obj)?;

    let native_param = native_node.position_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionY", &js_obj)?;

    let native_param = native_node.position_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionZ", &js_obj)?;

    let native_param = native_node.orientation_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("orientationX", &js_obj)?;

    let native_param = native_node.orientation_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("orientationY", &js_obj)?;

    let native_param = native_node.orientation_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("orientationZ", &js_obj)?;

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("PannerNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiPannerNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiPannerNode);

// -------------------------------------------------
// Getters / Setters
// -------------------------------------------------

#[js_function(0)]
fn get_panning_model(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.panning_model();
    let js_value = match value {
        PanningModelType::EqualPower => "equalpower",
        PanningModelType::HRTF => "HRTF",
    };

    ctx.env.create_string(js_value)
}

#[js_function(1)]
fn set_panning_model(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsObject>(0)?.coerce_to_string()?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "equalpower" => PanningModelType::EqualPower,
        "HRTF" => PanningModelType::HRTF,
        _ => unreachable!(),
    };

    node.set_panning_model(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_distance_model(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.distance_model();
    let js_value = match value {
        DistanceModelType::Linear => "linear",
        DistanceModelType::Inverse => "inverse",
        DistanceModelType::Exponential => "exponential",
    };

    ctx.env.create_string(js_value)
}

#[js_function(1)]
fn set_distance_model(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsObject>(0)?.coerce_to_string()?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "linear" => DistanceModelType::Linear,
        "inverse" => DistanceModelType::Inverse,
        "exponential" => DistanceModelType::Exponential,
        _ => unreachable!(),
    };

    node.set_distance_model(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_ref_distance(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.ref_distance();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_ref_distance(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_ref_distance(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_max_distance(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.max_distance();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_max_distance(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_max_distance(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_rolloff_factor(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.rolloff_factor();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_rolloff_factor(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_rolloff_factor(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_cone_inner_angle(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.cone_inner_angle();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_cone_inner_angle(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_cone_inner_angle(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_cone_outer_angle(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.cone_outer_angle();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_cone_outer_angle(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_cone_outer_angle(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn get_cone_outer_gain(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.cone_outer_gain();
    ctx.env.create_double(value)
}

#[js_function(1)]
fn set_cone_outer_gain(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()?;
    node.set_cone_outer_gain(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(3)]
fn set_position(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let x = ctx.get::<JsNumber>(0)?.get_double()? as f32;

    let y = ctx.get::<JsNumber>(1)?.get_double()? as f32;

    let z = ctx.get::<JsNumber>(2)?.get_double()? as f32;

    node.set_position(x, y, z);

    ctx.env.get_undefined()
}

#[js_function(3)]
fn set_orientation(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let x = ctx.get::<JsNumber>(0)?.get_double()? as f32;

    let y = ctx.get::<JsNumber>(1)?.get_double()? as f32;

    let z = ctx.get::<JsNumber>(2)?.get_double()? as f32;

    node.set_orientation(x, y, z);

    ctx.env.get_undefined()
}
