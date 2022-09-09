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

pub(crate) struct NapiPannerNode(Rc<PannerNode>);

impl NapiPannerNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "PannerNode",
            constructor,
            &[
                // Attributes
                Property::new("panningModel")?
                    .with_getter(get_panning_model)
                    .with_setter(set_panning_model)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("distanceModel")?
                    .with_getter(get_distance_model)
                    .with_setter(set_distance_model)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("refDistance")?
                    .with_getter(get_ref_distance)
                    .with_setter(set_ref_distance)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("maxDistance")?
                    .with_getter(get_max_distance)
                    .with_setter(set_max_distance)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("rolloffFactor")?
                    .with_getter(get_rolloff_factor)
                    .with_setter(set_rolloff_factor)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("coneInnerAngle")?
                    .with_getter(get_cone_inner_angle)
                    .with_setter(set_cone_inner_angle)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("coneOuterAngle")?
                    .with_getter(get_cone_outer_angle)
                    .with_setter(set_cone_outer_angle)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("coneOuterGain")?
                    .with_getter(get_cone_outer_gain)
                    .with_setter(set_cone_outer_gain)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Methods
                Property::new("setPosition")?
                    .with_method(set_position)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("setOrientation")?
                    .with_method(set_orientation)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // AudioNode interface
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &PannerNode {
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
            .with_value(&ctx.env.create_string("PannerNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // parse options

    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let some_panning_model_js = options_js.get::<&str, JsString>("panningModel")?;
            let panning_model = if let Some(panning_model_js) = some_panning_model_js {
                let panning_model_str = panning_model_js.into_utf8()?.into_owned()?;

                match panning_model_str.as_str() {
                    "equalpower" => PanningModelType::Equalpower,
                    "HRTF" => PanningModelType::HRTF,
                    _ => panic!("undefined value for PanningModelType"),
                }
            } else {
                PanningModelType::default()
            };

            let some_distance_model_js = options_js.get::<&str, JsString>("distanceModel")?;
            let distance_model = if let Some(distance_model_js) = some_distance_model_js {
                let distance_model_str = distance_model_js.into_utf8()?.into_owned()?;

                match distance_model_str.as_str() {
                    "linear" => DistanceModelType::Linear,
                    "inverse" => DistanceModelType::Inverse,
                    "exponential" => DistanceModelType::Exponential,
                    _ => panic!("undefined value for DistanceModelType"),
                }
            } else {
                DistanceModelType::default()
            };

            let some_position_x_js = options_js.get::<&str, JsNumber>("positionX")?;
            let position_x = if let Some(position_x_js) = some_position_x_js {
                position_x_js.get_double()? as f32
            } else {
                0.
            };

            let some_position_y_js = options_js.get::<&str, JsNumber>("positionY")?;
            let position_y = if let Some(position_y_js) = some_position_y_js {
                position_y_js.get_double()? as f32
            } else {
                0.
            };

            let some_position_z_js = options_js.get::<&str, JsNumber>("positionZ")?;
            let position_z = if let Some(position_z_js) = some_position_z_js {
                position_z_js.get_double()? as f32
            } else {
                0.
            };

            let some_orientation_x_js = options_js.get::<&str, JsNumber>("orientationX")?;
            let orientation_x = if let Some(orientation_x_js) = some_orientation_x_js {
                orientation_x_js.get_double()? as f32
            } else {
                1.
            };

            let some_orientation_y_js = options_js.get::<&str, JsNumber>("orientationY")?;
            let orientation_y = if let Some(orientation_y_js) = some_orientation_y_js {
                orientation_y_js.get_double()? as f32
            } else {
                0.
            };

            let some_orientation_z_js = options_js.get::<&str, JsNumber>("orientationZ")?;
            let orientation_z = if let Some(orientation_z_js) = some_orientation_z_js {
                orientation_z_js.get_double()? as f32
            } else {
                0.
            };

            let some_ref_distance_js = options_js.get::<&str, JsNumber>("refDistance")?;
            let ref_distance = if let Some(ref_distance_js) = some_ref_distance_js {
                ref_distance_js.get_double()? as f64
            } else {
                1.
            };

            let some_max_distance_js = options_js.get::<&str, JsNumber>("maxDistance")?;
            let max_distance = if let Some(max_distance_js) = some_max_distance_js {
                max_distance_js.get_double()? as f64
            } else {
                10000.
            };

            let some_rolloff_factor_js = options_js.get::<&str, JsNumber>("rolloffFactor")?;
            let rolloff_factor = if let Some(rolloff_factor_js) = some_rolloff_factor_js {
                rolloff_factor_js.get_double()? as f64
            } else {
                1.
            };

            let some_cone_inner_angle_js = options_js.get::<&str, JsNumber>("coneInnerAngle")?;
            let cone_inner_angle = if let Some(cone_inner_angle_js) = some_cone_inner_angle_js {
                cone_inner_angle_js.get_double()? as f64
            } else {
                360.
            };

            let some_cone_outer_angle_js = options_js.get::<&str, JsNumber>("coneOuterAngle")?;
            let cone_outer_angle = if let Some(cone_outer_angle_js) = some_cone_outer_angle_js {
                cone_outer_angle_js.get_double()? as f64
            } else {
                360.
            };

            let some_cone_outer_gain_js = options_js.get::<&str, JsNumber>("coneOuterGain")?;
            let cone_outer_gain = if let Some(cone_outer_gain_js) = some_cone_outer_gain_js {
                cone_outer_gain_js.get_double()? as f64
            } else {
                0.
            };

            PannerOptions {
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
                // for channel config
                ..Default::default()
            }
        }
        Either::B(_) => Default::default(),
    };

    let native_node = Rc::new(PannerNode::new(audio_context, options));

    // AudioParam: PannerNode::positionX
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::PannerNodePositionX(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionX", &js_obj)?;

    // AudioParam: PannerNode::positionY
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::PannerNodePositionY(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionY", &js_obj)?;

    // AudioParam: PannerNode::positionZ
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::PannerNodePositionZ(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("positionZ", &js_obj)?;

    // AudioParam: PannerNode::orientationX
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::PannerNodeOrientationX(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("orientationX", &js_obj)?;

    // AudioParam: PannerNode::orientationY
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::PannerNodeOrientationY(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("orientationY", &js_obj)?;

    // AudioParam: PannerNode::orientationZ
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::PannerNodeOrientationZ(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("orientationZ", &js_obj)?;

    // finalize instance creation
    let napi_node = NapiPannerNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiPannerNode);
// disconnect_method!(NapiPannerNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

#[js_function(0)]
fn get_panning_model(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.panning_model();
    let js_value = match value {
        PanningModelType::Equalpower => "equalpower",
        PanningModelType::HRTF => "HRTF",
    };

    ctx.env.create_string(js_value)
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

#[js_function(0)]
fn get_ref_distance(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.ref_distance();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_max_distance(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.max_distance();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_rolloff_factor(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.rolloff_factor();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_cone_inner_angle(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.cone_inner_angle();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_cone_outer_angle(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.cone_outer_angle();
    ctx.env.create_double(value as f64)
}

#[js_function(0)]
fn get_cone_outer_gain(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.cone_outer_gain();
    ctx.env.create_double(value as f64)
}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

#[js_function(0)]
fn set_panning_model(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "equalpower" => PanningModelType::Equalpower,
        "HRTF" => PanningModelType::HRTF,
        _ => panic!("undefined value for PanningModelType"),
    };

    node.set_panning_model(value);

    ctx.env.get_undefined()
}

#[js_function(0)]
fn set_distance_model(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {
        "linear" => DistanceModelType::Linear,
        "inverse" => DistanceModelType::Inverse,
        "exponential" => DistanceModelType::Exponential,
        _ => panic!("undefined value for DistanceModelType"),
    };

    node.set_distance_model(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_ref_distance(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_ref_distance(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_max_distance(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_max_distance(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_rolloff_factor(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_rolloff_factor(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_cone_inner_angle(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_cone_inner_angle(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_cone_outer_angle(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_cone_outer_angle(value);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn set_cone_outer_gain(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
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
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let mut x_js = ctx.get::<JsNumber>(0)?;
    let x = x_js.get_double() as f32;

    let mut y_js = ctx.get::<JsNumber>(1)?;
    let y = y_js.get_double() as f32;

    let mut z_js = ctx.get::<JsNumber>(2)?;
    let z = z_js.get_double() as f32;

    node.set_position(x, y, z);

    ctx.env.get_undefined()
}

#[js_function(3)]
fn set_orientation(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiPannerNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    let mut x_js = ctx.get::<JsNumber>(0)?;
    let x = x_js.get_double() as f32;

    let mut y_js = ctx.get::<JsNumber>(1)?;
    let y = y_js.get_double() as f32;

    let mut z_js = ctx.get::<JsNumber>(2)?;
    let z = z_js.get_double() as f32;

    node.set_orientation(x, y, z);

    ctx.env.get_undefined()
}
