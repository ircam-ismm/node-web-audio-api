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

use napi::*;
use napi_derive::js_function;
use web_audio_api::{AudioParam, AutomationRate};

pub(crate) struct NapiAudioParam(AudioParam);

impl NapiAudioParam {
    pub fn new(audio_param: AudioParam) -> Self {
        Self(audio_param)
    }

    pub fn create_js_object(env: &Env) -> Result<JsObject> {
        let mut obj = env.create_object()?;

        obj.define_properties(&[
            Property::new("Symbol.toStringTag")?
                .with_value(&env.create_string("AudioParam")?)
                .with_property_attributes(PropertyAttributes::Static),
            // Attributes
            Property::new("automationRate")?
                .with_getter(get_automation_rate)
                .with_setter(set_automation_rate),
            Property::new("defaultValue")?.with_getter(get_default_value),
            Property::new("maxValue")?.with_getter(get_max_value),
            Property::new("minValue")?.with_getter(get_min_value),
            Property::new("value")?
                .with_getter(get_value)
                .with_setter(set_value),
            // Methods
            Property::new("setValueAtTime")?.with_method(set_value_at_time),
            Property::new("linearRampToValueAtTime")?.with_method(linear_ramp_to_value_at_time),
            Property::new("exponentialRampToValueAtTime")?
                .with_method(exponential_ramp_to_value_at_time),
            Property::new("setValueCurveAtTime")?.with_method(set_value_curve_at_time),
            Property::new("setTargetAtTime")?.with_method(set_target_at_time),
            Property::new("cancelScheduledValues")?.with_method(cancel_scheduled_values),
            Property::new("cancelAndHoldAtTime")?.with_method(cancel_and_hold_at_time),
        ])?;

        Ok(obj)
    }

    pub fn unwrap(&self) -> &AudioParam {
        &self.0
    }
}

// Attributes
#[js_function]
fn get_automation_rate(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = obj.automation_rate();
    let value_str = match value {
        AutomationRate::A => "a-rate",
        AutomationRate::K => "k-rate",
    };

    ctx.env.create_string(value_str)
}

#[js_function(1)]
fn set_automation_rate(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = &mut napi_obj.0;

    let js_str = ctx.get::<JsObject>(0)?;
    let utf8_str = js_str.coerce_to_string()?.into_utf8()?.into_owned()?;
    let value = match utf8_str.as_str() {
        "a-rate" => AutomationRate::A,
        "k-rate" => AutomationRate::K,
        _ => panic!(
            "The provided value '{:?}' is not a valid enum value of type AutomationRate.",
            utf8_str
        ),
    };
    obj.set_automation_rate(value);

    ctx.env.get_undefined()
}

#[js_function]
fn get_default_value(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = obj.default_value();
    ctx.env.create_double(value as f64)
}

#[js_function]
fn get_max_value(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = obj.max_value();
    ctx.env.create_double(value as f64)
}

#[js_function]
fn get_min_value(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = obj.min_value();
    ctx.env.create_double(value as f64)
}

#[js_function]
fn get_value(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = obj.value();
    ctx.env.create_double(value as f64)
}

#[js_function(1)]
fn set_value(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()? as f32;
    obj.set_value(value);

    ctx.env.get_undefined()
}

// Methods
#[js_function(2)]
fn set_value_at_time(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    let start_time = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
    obj.set_value_at_time(value as f32, start_time);

    Ok(js_this)
}

#[js_function(2)]
fn linear_ramp_to_value_at_time(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()? as f32;
    let end_time = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
    obj.linear_ramp_to_value_at_time(value, end_time);

    Ok(js_this)
}

#[js_function(2)]
fn exponential_ramp_to_value_at_time(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()? as f32;
    let end_time = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
    obj.exponential_ramp_to_value_at_time(value, end_time);

    Ok(js_this)
}

#[js_function(3)]
fn set_value_curve_at_time(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let mut typed_array_values = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let values: &mut [f32] = typed_array_values.as_mut();

    let start_time = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
    let duration = ctx.get::<JsObject>(2)?.coerce_to_number()?.get_double()?;
    obj.set_value_curve_at_time(values, start_time, duration);

    Ok(js_this)
}

#[js_function(3)]
fn set_target_at_time(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let value = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()? as f32;
    let start_time = ctx.get::<JsObject>(1)?.coerce_to_number()?.get_double()?;
    let time_constant = ctx.get::<JsObject>(2)?.coerce_to_number()?.get_double()?;
    obj.set_target_at_time(value, start_time, time_constant);

    Ok(js_this)
}

#[js_function(1)]
fn cancel_scheduled_values(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let cancel_time = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    obj.cancel_scheduled_values(cancel_time);

    Ok(js_this)
}

#[js_function(1)]
fn cancel_and_hold_at_time(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_this)?;
    let obj = napi_obj.unwrap();

    let cancel_time = ctx.get::<JsObject>(0)?.coerce_to_number()?.get_double()?;
    obj.cancel_and_hold_at_time(cancel_time);

    Ok(js_this)
}
