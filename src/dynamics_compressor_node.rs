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
// impl Drop for NapiDynamicsCompressorNode {
//     fn drop(&mut self) {
//         println!("NAPI: NapiDynamicsCompressorNode dropped");
//     }
// }

impl NapiDynamicsCompressorNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "DynamicsCompressorNode",
            constructor,
            &[
                // Attributes
                Property::new("reduction")?
                    .with_getter(get_reduction)
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
    pub fn unwrap(&mut self) -> &mut DynamicsCompressorNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    if ctx.length < 1 {
        let msg = "Failed to construct 'DynamicsCompressorNode': 1 argument required, but only 0 present.";
        return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    }

    // first argument should be an AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;
    // check that
    let audio_context_utf8_name = if let Ok(audio_context_name) =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")
    {
        let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
        let audio_context_str = &audio_context_utf8_name[..];

        if audio_context_str != "AudioContext" && audio_context_str != "OfflineAudioContext" {
            let msg = "Failed to construct 'DynamicsCompressorNode': argument 0 should be an instance of BaseAudioContext";
            return Err(napi::Error::new(napi::Status::InvalidArg, msg));
        }

        audio_context_utf8_name
    } else {
        // this crashes in debug mode but not in release mode, weird...
        // > Throw error failed, status: [PendingException], raw message: "...", raw status: [InvalidArg]
        // > note: run with 'RUST_BACKTRACE=1' environment variable to display a backtrace
        // > fatal runtime error: failed to initiate panic, error 5
        let msg = "Failed to construct 'DynamicsCompressorNode': argument 0 should be an instance of BaseAudioContext";
        return Err(napi::Error::new(napi::Status::InvalidArg, msg));
    };

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("DynamicsCompressorNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // parse options
    let options = if let Ok(either_options) = ctx.try_get::<JsObject>(1) {
        match either_options {
            Either::A(options_js) => {
                let some_attack_js = options_js.get::<&str, JsNumber>("attack")?;
                let attack = if let Some(attack_js) = some_attack_js {
                    attack_js.get_double()? as f32
                } else {
                    0.003
                };

                let some_knee_js = options_js.get::<&str, JsNumber>("knee")?;
                let knee = if let Some(knee_js) = some_knee_js {
                    knee_js.get_double()? as f32
                } else {
                    30.
                };

                let some_ratio_js = options_js.get::<&str, JsNumber>("ratio")?;
                let ratio = if let Some(ratio_js) = some_ratio_js {
                    ratio_js.get_double()? as f32
                } else {
                    12.
                };

                let some_release_js = options_js.get::<&str, JsNumber>("release")?;
                let release = if let Some(release_js) = some_release_js {
                    release_js.get_double()? as f32
                } else {
                    0.25
                };

                let some_threshold_js = options_js.get::<&str, JsNumber>("threshold")?;
                let threshold = if let Some(threshold_js) = some_threshold_js {
                    threshold_js.get_double()? as f32
                } else {
                    -24.
                };

                let node_defaults = DynamicsCompressorOptions::default();
                let channel_config_defaults = node_defaults.channel_config;

                let some_channel_count_js = options_js.get::<&str, JsNumber>("channelCount")?;
                let channel_count = if let Some(channel_count_js) = some_channel_count_js {
                    channel_count_js.get_double()? as usize
                } else {
                    channel_config_defaults.count
                };

                let some_channel_count_mode_js =
                    options_js.get::<&str, JsString>("channelCountMode")?;
                let channel_count_mode = if let Some(channel_count_mode_js) =
                    some_channel_count_mode_js
                {
                    let channel_count_mode_str = channel_count_mode_js.into_utf8()?.into_owned()?;

                    match channel_count_mode_str.as_str() {
                        "max" => ChannelCountMode::Max,
                        "clamped-max" => ChannelCountMode::ClampedMax,
                        "explicit" => ChannelCountMode::Explicit,
                        _ => panic!("undefined value for ChannelCountMode"),
                    }
                } else {
                    channel_config_defaults.count_mode
                };

                let some_channel_interpretation_js =
                    options_js.get::<&str, JsString>("channelInterpretation")?;
                let channel_interpretation =
                    if let Some(channel_interpretation_js) = some_channel_interpretation_js {
                        let channel_interpretation_str =
                            channel_interpretation_js.into_utf8()?.into_owned()?;

                        match channel_interpretation_str.as_str() {
                            "speakers" => ChannelInterpretation::Speakers,
                            "discrete" => ChannelInterpretation::Discrete,
                            _ => panic!("undefined value for ChannelInterpretation"),
                        }
                    } else {
                        channel_config_defaults.interpretation
                    };

                DynamicsCompressorOptions {
                    attack,
                    knee,
                    ratio,
                    release,
                    threshold,
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

    // AudioParam: DynamicsCompressorNode::threshold
    let native_param = native_node.threshold().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("threshold", &js_obj)?;

    // AudioParam: DynamicsCompressorNode::knee
    let native_param = native_node.knee().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("knee", &js_obj)?;

    // AudioParam: DynamicsCompressorNode::ratio
    let native_param = native_node.ratio().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("ratio", &js_obj)?;

    // AudioParam: DynamicsCompressorNode::attack
    let native_param = native_node.attack().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("attack", &js_obj)?;

    // AudioParam: DynamicsCompressorNode::release
    let native_param = native_node.release().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("release", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiDynamicsCompressorNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "max" => ChannelCountMode::Max,
        "clamped-max" => ChannelCountMode::ClampedMax,
        "explicit" => ChannelCountMode::Explicit,
        _ => panic!("undefined value for ChannelCountMode"),
    };
    node.set_channel_count_mode(value);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_interpretation(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let utf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "speakers" => ChannelInterpretation::Speakers,
        "discrete" => ChannelInterpretation::Discrete,
        _ => panic!("undefined value for ChannelInterpretation"),
    };
    node.set_channel_interpretation(value);

    ctx.env.get_undefined()
}

#[js_function]
fn get_number_of_inputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_inputs = node.number_of_inputs() as f64;

    ctx.env.create_double(number_of_inputs)
}

#[js_function]
fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let number_of_outputs = node.number_of_outputs() as f64;

    ctx.env.create_double(number_of_outputs)
}

// -------------------------------------------------
// connect / disconnect macros
// -------------------------------------------------
connect_method!(NapiDynamicsCompressorNode);
disconnect_method!(NapiDynamicsCompressorNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_reduction(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiDynamicsCompressorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.reduction();
    ctx.env.create_double(value as f64)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

// -------------------------------------------------
// METHODS
// -------------------------------------------------
