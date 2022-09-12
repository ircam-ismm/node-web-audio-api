// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use crate::*;
use napi_derive::js_function;
use std::rc::Rc;
use web_audio_api::node::*;

pub(crate) struct NapiBiquadFilterNode(Rc<BiquadFilterNode>);

impl NapiBiquadFilterNode {
    pub fn create_js_class(env: &napi::Env) -> napi::Result<napi::JsFunction> {
        env.define_class(
            "BiquadFilterNode",
            constructor,
            &[
                // Attributes
                napi::Property::new("type")?
                    .with_getter(get_type)
                    .with_setter(set_type)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // Methods
                napi::Property::new("getFrequencyResponse")?
                    .with_method(get_frequency_response)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // AudioNode interface
                napi::Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // napi::Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &BiquadFilterNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let mut js_this = ctx.this_unchecked::<napi::JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<napi::JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        napi::Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(napi::PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        napi::Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("BiquadFilterNode")?)
            .with_property_attributes(napi::PropertyAttributes::Static),
    ])?;

    // parse options

    let options = match ctx.try_get::<napi::JsObject>(1)? {
        napi::Either::A(options_js) => {
            let some_type_js = options_js.get::<&str, napi::JsString>("type")?;
            let type_ = if let Some(type_js) = some_type_js {
                let type_str = type_js.into_utf8()?.into_owned()?;

                match type_str.as_str() {
                    "lowpass" => BiquadFilterType::Lowpass,
                    "highpass" => BiquadFilterType::Highpass,
                    "bandpass" => BiquadFilterType::Bandpass,
                    "lowshelf" => BiquadFilterType::Lowshelf,
                    "highshelf" => BiquadFilterType::Highshelf,
                    "peaking" => BiquadFilterType::Peaking,
                    "notch" => BiquadFilterType::Notch,
                    "allpass" => BiquadFilterType::Allpass,
                    _ => panic!("undefined value for BiquadFilterType"),
                }
            } else {
                BiquadFilterType::default()
            };

            let some_q_js = options_js.get::<&str, napi::JsNumber>("Q")?;
            let q = if let Some(q_js) = some_q_js {
                q_js.get_double()? as f32
            } else {
                1.
            };

            let some_detune_js = options_js.get::<&str, napi::JsNumber>("detune")?;
            let detune = if let Some(detune_js) = some_detune_js {
                detune_js.get_double()? as f32
            } else {
                0.
            };

            let some_frequency_js = options_js.get::<&str, napi::JsNumber>("frequency")?;
            let frequency = if let Some(frequency_js) = some_frequency_js {
                frequency_js.get_double()? as f32
            } else {
                350.
            };

            let some_gain_js = options_js.get::<&str, napi::JsNumber>("gain")?;
            let gain = if let Some(gain_js) = some_gain_js {
                gain_js.get_double()? as f32
            } else {
                0.
            };

            BiquadFilterOptions {
                type_,
                q,
                detune,
                frequency,
                gain,
                channel_config: ChannelConfigOptions::default(),
            }
        }
        napi::Either::B(_) => {
            return Err(napi::Error::from_reason(
                "Options are mandatory for node BiquadFilterNode".to_string(),
            ));
        }
    };

    let native_node = Rc::new(BiquadFilterNode::new(audio_context, options));

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
fn get_type(ctx: napi::CallContext) -> napi::Result<napi::JsString> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
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
fn set_type(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<napi::JsString>(0)?;
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

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(3)]
fn get_frequency_response(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiBiquadFilterNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    #[allow(clippy::unnecessary_mut_passed)]
    let mut frequency_hz_js = ctx.get::<napi::JsTypedArray>(0)?.into_value()?;
    let frequency_hz: &mut [f32] = frequency_hz_js.as_mut();

    #[allow(clippy::unnecessary_mut_passed)]
    let mut mag_response_js = ctx.get::<napi::JsTypedArray>(1)?.into_value()?;
    let mag_response: &mut [f32] = mag_response_js.as_mut();

    #[allow(clippy::unnecessary_mut_passed)]
    let mut phase_response_js = ctx.get::<napi::JsTypedArray>(2)?.into_value()?;
    let phase_response: &mut [f32] = phase_response_js.as_mut();

    node.get_frequency_response(frequency_hz, mag_response, phase_response);

    ctx.env.get_undefined()
}
