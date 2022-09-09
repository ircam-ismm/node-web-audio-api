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

pub(crate) struct NapiOscillatorNode(Rc<OscillatorNode>);

impl NapiOscillatorNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "OscillatorNode",
            constructor,
            &[
                // Attributes
                Property::new("type")?
                    .with_getter(get_type)
                    .with_setter(set_type)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Methods
                Property::new("setPeriodicWave")?
                    .with_method(set_periodic_wave)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // AudioNode interface
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),

                // AudioScheduledSourceNode interface
                Property::new("start")?
                    .with_method(start)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("stop")?
                    .with_method(stop)
                    .with_property_attributes(PropertyAttributes::Enumerable),
            ],
        )
    }

    pub fn unwrap(&self) -> &OscillatorNode {
        &self.0
    }
}

// undefined

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
            .with_value(&ctx.env.create_string("OscillatorNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let native_node = Rc::new(OscillatorNode::new(audio_context, Default::default()));

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
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.start();
    } else {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.start_at(when);
    }

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.stop();
    } else {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.stop_at(when);
    };

    ctx.env.get_undefined()
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_type(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
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
fn set_type(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
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
fn set_periodic_wave(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiOscillatorNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    ctx.env.get_undefined()
}
