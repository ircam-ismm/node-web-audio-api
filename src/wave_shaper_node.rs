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
                    .with_setter(set_curve),
                Property::new("oversample")?
                    .with_getter(get_oversample)
                    .with_setter(set_oversample),
                // Methods

                // AudioNode interface
                Property::new("connect")?.with_method(connect),
                // Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &WaveShaperNode {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.set_named_property("context", js_audio_context)?;
    js_this.set_named_property(
        "Symbol.toStringTag",
        ctx.env.create_string("WaveShaperNode")?,
    )?;

    let native_node = Rc::new(WaveShaperNode::new(audio_context, Default::default()));

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
