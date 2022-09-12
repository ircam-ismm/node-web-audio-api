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

pub(crate) struct NapiWaveShaperNode(Rc<WaveShaperNode>);

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
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &WaveShaperNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("WaveShaperNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let curve = if let Some(curve_js) = options_js.get::<&str, JsTypedArray>("curve")? {
                let curve_value = curve_js.into_value()?;
                let curve: &[f32] = curve_value.as_ref();

                Some(curve.to_vec())
            } else {
                None
            };

            let some_oversample_js = options_js.get::<&str, JsString>("oversample")?;
            let oversample = if let Some(oversample_js) = some_oversample_js {
                let oversample_str = oversample_js.into_utf8()?.into_owned()?;

                match oversample_str.as_str() {
                    "none" => OverSampleType::None,
                    "2x" => OverSampleType::X2,
                    "4x" => OverSampleType::X4,
                    _ => panic!("undefined value for OverSampleType"),
                }
            } else {
                OverSampleType::default()
            };

            WaveShaperOptions {
                curve,
                oversample,
                channel_config: ChannelConfigOptions::default(),
            }
        }
        Either::B(_) => Default::default(),
    };

    let native_node = Rc::new(WaveShaperNode::new(audio_context, options));

    // finalize instance creation
    let napi_node = NapiWaveShaperNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiWaveShaperNode);
// disconnect_method!(NapiWaveShaperNode);

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
    js_this.set_named_property("__curve__", js_obj)?;

    ctx.env.get_undefined()
}

#[js_function(0)]
fn set_oversample(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiWaveShaperNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "none" => OverSampleType::None,
        "2x" => OverSampleType::X2,
        "4x" => OverSampleType::X4,
        _ => panic!("undefined value for OverSampleType"),
    };

    node.set_oversample(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------
