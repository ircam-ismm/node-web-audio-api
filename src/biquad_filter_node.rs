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

pub(crate) struct NapiBiquadFilterNode(Rc<BiquadFilterNode>);

impl NapiBiquadFilterNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "BiquadFilterNode",
            constructor,
            &[
                // Attributes
                Property::new("type")?
                    .with_getter(get_type)
                    .with_setter(set_type)
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

    pub fn unwrap(&self) -> &BiquadFilterNode {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("BiquadFilterNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let native_node = Rc::new(BiquadFilterNode::new(audio_context, Default::default()));

    // AudioParam: BiquadFilterNode::frequency
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::BiquadFilterNodeFrequency(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("frequency", &js_obj)?;

    // AudioParam: BiquadFilterNode::detune
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::BiquadFilterNodeDetune(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("detune", &js_obj)?;

    // AudioParam: BiquadFilterNode::Q
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::BiquadFilterNodeQ(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("Q", &js_obj)?;

    // AudioParam: BiquadFilterNode::gain
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::BiquadFilterNodeGain(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("gain", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiBiquadFilterNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiBiquadFilterNode);
// disconnect_method!(NapiBiquadFilterNode);

// -------------------------------------------------
// GETTERS
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

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(0)]
fn set_type(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "lowpass" => BiquadFilterType::Lowpass,
        "highpass" => BiquadFilterType::Highpass,
        "bandpass" => BiquadFilterType::Bandpass,
        "lowshelf" => BiquadFilterType::Lowshelf,
        "highshelf" => BiquadFilterType::Highshelf,
        "peaking" => BiquadFilterType::Peaking,
        "notch" => BiquadFilterType::Notch,
        "allpass" => BiquadFilterType::Allpass,
        _ => panic!("undefined value for BiquadFilterType"),
    };

    node.set_type(value);

    ctx.env.get_undefined()
}
