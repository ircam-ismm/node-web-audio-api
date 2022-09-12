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

pub(crate) struct NapiOscillatorNode(Rc<OscillatorNode>);

impl NapiOscillatorNode {
    pub fn create_js_class(env: &napi::Env) -> napi::Result<napi::JsFunction> {
        env.define_class(
            "OscillatorNode",
            constructor,
            &[
                // Attributes
                napi::Property::new("type")?
                    .with_getter(get_type)
                    .with_setter(set_type)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // Methods
                napi::Property::new("setPeriodicWave")?
                    .with_method(set_periodic_wave)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // AudioNode interface
                napi::Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // napi::Property::new("disconnect")?.with_method(disconnect),

                // AudioScheduledSourceNode interface
                napi::Property::new("start")?
                    .with_method(start)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                napi::Property::new("stop")?
                    .with_method(stop)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
            ],
        )
    }

    pub fn unwrap(&self) -> &OscillatorNode {
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
            .with_value(&ctx.env.create_string("OscillatorNode")?)
            .with_property_attributes(napi::PropertyAttributes::Static),
    ])?;

    // parse options

    let options = match ctx.try_get::<napi::JsObject>(1)? {
        napi::Either::A(options_js) => {
            let some_type_js = options_js.get::<&str, napi::JsString>("type")?;
            let type_ = if let Some(type_js) = some_type_js {
                let type_str = type_js.into_utf8()?.into_owned()?;

                match type_str.as_str() {
                    "sine" => OscillatorType::Sine,
                    "square" => OscillatorType::Square,
                    "sawtooth" => OscillatorType::Sawtooth,
                    "triangle" => OscillatorType::Triangle,
                    "custom" => OscillatorType::Custom,
                    _ => panic!("undefined value for OscillatorType"),
                }
            } else {
                OscillatorType::default()
            };

            let some_frequency_js = options_js.get::<&str, napi::JsNumber>("frequency")?;
            let frequency = if let Some(frequency_js) = some_frequency_js {
                frequency_js.get_double()? as f32
            } else {
                440.
            };

            let some_detune_js = options_js.get::<&str, napi::JsNumber>("detune")?;
            let detune = if let Some(detune_js) = some_detune_js {
                detune_js.get_double()? as f32
            } else {
                0.
            };

            let some_periodic_wave_js = options_js.get::<&str, napi::JsObject>("periodicWave")?;
            let periodic_wave = if let Some(periodic_wave_js) = some_periodic_wave_js {
                let periodic_wave_napi = ctx.env.unwrap::<NapiPeriodicWave>(&periodic_wave_js)?;
                Some(periodic_wave_napi.unwrap().clone())
            } else {
                None
            };

            OscillatorOptions {
                type_,
                frequency,
                detune,
                periodic_wave,
                channel_config: ChannelConfigOptions::default(),
            }
        }
        napi::Either::B(_) => {
            return Err(napi::Error::from_reason(
                "Options are mandatory for node OscillatorNode".to_string(),
            ));
        }
    };

    let native_node = Rc::new(OscillatorNode::new(audio_context, options));

    // AudioParam: OscillatorNode::frequency
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::OscillatorNodeFrequency(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("frequency", &js_obj)?;

    // AudioParam: OscillatorNode::detune
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::OscillatorNodeDetune(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("detune", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiOscillatorNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiOscillatorNode);
// disconnect_method!(NapiOscillatorNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
#[js_function(1)]
fn start(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.start();
    } else {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        node.start_at(when);
    }

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.stop();
    } else {
        let when = ctx.get::<napi::JsNumber>(0)?.try_into()?;
        node.stop_at(when);
    };

    ctx.env.get_undefined()
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_type(ctx: napi::CallContext) -> napi::Result<napi::JsString> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.type_();
    let js_value = match value {
        OscillatorType::Sine => "sine",
        OscillatorType::Square => "square",
        OscillatorType::Sawtooth => "sawtooth",
        OscillatorType::Triangle => "triangle",
        OscillatorType::Custom => "custom",
    };

    ctx.env.create_string(js_value)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(0)]
fn set_type(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<napi::JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "sine" => OscillatorType::Sine,
        "square" => OscillatorType::Square,
        "sawtooth" => OscillatorType::Sawtooth,
        "triangle" => OscillatorType::Triangle,
        "custom" => OscillatorType::Custom,
        _ => panic!("undefined value for OscillatorType"),
    };

    node.set_type(value);

    ctx.env.get_undefined()
}

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(1)]
fn set_periodic_wave(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let js_this = ctx.this_unchecked::<napi::JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let periodic_wave_js = ctx.get::<napi::JsObject>(0)?;
    let periodic_wave_napi = ctx.env.unwrap::<NapiPeriodicWave>(&periodic_wave_js)?;
    let periodic_wave = periodic_wave_napi.unwrap().clone();

    node.set_periodic_wave(periodic_wave);

    ctx.env.get_undefined()
}
