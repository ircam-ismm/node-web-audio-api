// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use crate::*;
use napi::*;
use napi_derive::js_function;
use std::rc::Rc;
use web_audio_api::node::*;

pub(crate) struct NapiConvolverNode(Rc<ConvolverNode>);

impl NapiConvolverNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "ConvolverNode",
            constructor,
            &[
                // Attributes
                Property::new("buffer")?
                    .with_getter(get_buffer)
                    .with_setter(set_buffer)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("normalize")?
                    .with_getter(get_normalize)
                    .with_setter(set_normalize)
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
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("disconnect")?
                    .with_method(disconnect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
            ],
        )
    }

    pub fn unwrap(&self) -> &ConvolverNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("ConvolverNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // parse options
    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let some_buffer_js = options_js.get::<&str, JsObject>("buffer")?;
            let buffer = if let Some(buffer_js) = some_buffer_js {
                let buffer_napi = ctx.env.unwrap::<NapiAudioBuffer>(&buffer_js)?;
                Some(buffer_napi.unwrap().clone())
            } else {
                None
            };

            let some_disable_normalization_js =
                options_js.get::<&str, JsBoolean>("disableNormalization")?;
            let disable_normalization =
                if let Some(disable_normalization_js) = some_disable_normalization_js {
                    disable_normalization_js.try_into()?
                } else {
                    false
                };

            let node_defaults = ConvolverOptions::default();
            let channel_config_defaults = node_defaults.channel_config;

            let some_channel_count_js = options_js.get::<&str, JsNumber>("channelCount")?;
            let channel_count = if let Some(channel_count_js) = some_channel_count_js {
                channel_count_js.get_double()? as usize
            } else {
                channel_config_defaults.count
            };

            let some_channel_count_mode_js =
                options_js.get::<&str, JsString>("channelCountMode")?;
            let channel_count_mode = if let Some(channel_count_mode_js) = some_channel_count_mode_js
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

            ConvolverOptions {
                buffer,
                disable_normalization,
                channel_config: ChannelConfigOptions {
                    count: channel_count,
                    count_mode: channel_count_mode,
                    interpretation: channel_interpretation,
                },
            }
        }
        Either::B(_) => Default::default(),
    };

    // create native node
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            Rc::new(ConvolverNode::new(audio_context, options))
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            Rc::new(ConvolverNode::new(audio_context, options))
        }
        &_ => panic!("not supported"),
    };

    // finalize instance creation
    let napi_node = NapiConvolverNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
#[js_function]
fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = node.channel_count() as f64;

    ctx.env.create_double(channel_count)
}

#[js_function(1)]
fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    node.set_channel_count(channel_count);

    ctx.env.get_undefined()
}

#[js_function]
fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
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
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
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
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "speakers" => ChannelInterpretation::Speakers,
        "discrete" => ChannelInterpretation::Discrete,
        _ => panic!("undefined value for ChannelInterpretation"),
    };
    node.set_channel_interpretation(value);

    ctx.env.get_undefined()
}

connect_method!(NapiConvolverNode);
disconnect_method!(NapiConvolverNode);
// disconnect_method!(NapiConvolverNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_buffer(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();

    if js_this.has_named_property("__buffer__")? {
        Ok(js_this
            .get_named_property::<JsObject>("__buffer__")?
            .into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}

#[js_function(0)]
fn get_normalize(ctx: CallContext) -> Result<JsBoolean> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.normalize();
    ctx.env.get_boolean(value)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(1)]
fn set_buffer(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConvolverNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_buffer(obj.clone());
    // store in "private" field for getter (not very clean, to review)
    js_this.set_named_property("__buffer__", js_obj)?;

    ctx.env.get_undefined()
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

// -------------------------------------------------
// METHODS
// -------------------------------------------------
