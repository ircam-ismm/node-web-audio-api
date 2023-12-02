use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::AudioListener;

pub struct NapiAudioListener(AudioListener);

// should be a class
impl NapiAudioListener {
    pub fn new(audio_listener: AudioListener) -> Self {
        Self(audio_listener)
    }

    pub fn create_js_object(env: &Env) -> Result<JsObject> {
        let mut obj = env.create_object()?;
        obj.define_properties(&[
            Property::new("Symbol.toStringTag")?
                .with_value(&env.create_string("AudioListener")?)
                .with_property_attributes(PropertyAttributes::Static),
            Property::new("positionX")?.with_getter(get_position_x),
            Property::new("positionY")?.with_getter(get_position_y),
            Property::new("positionZ")?.with_getter(get_position_z),
            Property::new("forwardX")?.with_getter(get_forward_x),
            Property::new("forwardY")?.with_getter(get_forward_y),
            Property::new("forwardZ")?.with_getter(get_forward_z),
            Property::new("upX")?.with_getter(get_up_x),
            Property::new("upY")?.with_getter(get_up_y),
            Property::new("upZ")?.with_getter(get_up_z),
        ])?;

        Ok(obj)
    }

    pub fn unwrap(&self) -> &AudioListener {
        &self.0
    }
}

#[js_function]
fn get_position_x(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.position_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_position_y(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.position_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_position_z(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.position_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_forward_x(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.forward_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_forward_y(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.forward_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_forward_z(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.forward_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_up_x(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.up_x().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_up_y(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.up_y().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}

#[js_function]
fn get_up_z(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioListener>(&js_this)?;
    let node = napi_node.unwrap();

    let native_param = node.up_z().clone();
    let napi_param = NapiAudioParam::new(native_param);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    Ok(js_obj)
}
