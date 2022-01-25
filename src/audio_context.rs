// ----------------------------------------------------------
// ----------------------------------------------------------
// /! WARNING - DO NOT EDIT
// This file has been generated
// ----------------------------------------------------------
// ----------------------------------------------------------

use std::fs::File;
use napi::*;
use napi_derive::js_function;
use web_audio_api::context::*;
use crate::*;


pub(crate) struct NapiAudioContext(AudioContext);

impl NapiAudioContext {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioContext",
            constructor,
            &[
                Property::new("currentTime")?.with_getter(current_time),
                Property::new("sampleRate")?.with_getter(sample_rate),
                Property::new("decodeAudioData")?.with_method(decode_audio_data),

                // ----------------------------------------------------
                // Factory methods
                // ----------------------------------------------------
                
                Property::new("createBufferSource")?.with_method(create_buffer_source),
                Property::new("createBiquadFilter")?.with_method(create_biquad_filter),
                Property::new("createConstantSource")?.with_method(create_constant_source),
                Property::new("createDelay")?.with_method(create_delay),
                Property::new("createGain")?.with_method(create_gain),
                Property::new("createOscillator")?.with_method(create_oscillator),
                Property::new("createStereoPanner")?.with_method(create_stereo_panner),
                Property::new("createWaveShaper")?.with_method(create_wave_shaper),
            ],
        )
    }

    pub fn unwrap(&self) -> &AudioContext {
        &self.0
    }
}

#[js_function]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let audio_context = AudioContext::new(None);
    let napi_audio_context = NapiAudioContext(audio_context);
    ctx.env.wrap(&mut js_this, napi_audio_context)?;

    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("AudioContext")?)?;

    // Audio Destination
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioDestinationNode")?;
    let js_obj = ctor.new_instance(&[&js_this])?;
    js_this.set_named_property("destination", &js_obj)?;

    ctx.env.get_undefined()
}

#[js_function]
fn current_time(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let current_time = obj.current_time() as f64;
    ctx.env.create_double(current_time)
}

#[js_function]
fn sample_rate(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let sample_rate = obj.sample_rate() as f64;
    ctx.env.create_double(sample_rate)
}

#[js_function(1)]
fn decode_audio_data(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let context = napi_obj.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let js_path = js_obj.get_named_property::<JsString>("path")?;
    let uf8_path = js_path.into_utf8()?.into_owned()?;
    let str_path = &uf8_path[..];

    let file = File::open(str_path).unwrap();
    let audio_buffer = context.decode_audio_data(file).unwrap();

    // create js audio buffer instance
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioBuffer")?;
    let init = ctx.env.get_boolean(false)?;
    let js_audio_buffer = ctor.new_instance(&[init])?;
    let napi_audio_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_audio_buffer)?;
    napi_audio_buffer.populate(audio_buffer);

    Ok(js_audio_buffer)
}

// ----------------------------------------------------
// Factory methods
// ----------------------------------------------------

#[js_function]
fn create_buffer_source(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioBufferSourceNode")?;

    ctor.new_instance(&[js_this])
}
    
#[js_function]
fn create_biquad_filter(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("BiquadFilterNode")?;

    ctor.new_instance(&[js_this])
}
    
#[js_function]
fn create_constant_source(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("ConstantSourceNode")?;

    ctor.new_instance(&[js_this])
}
    
#[js_function]
fn create_delay(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("DelayNode")?;

    ctor.new_instance(&[js_this])
}
    
#[js_function]
fn create_gain(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("GainNode")?;

    ctor.new_instance(&[js_this])
}
    
#[js_function]
fn create_oscillator(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("OscillatorNode")?;

    ctor.new_instance(&[js_this])
}
    
#[js_function]
fn create_stereo_panner(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("StereoPannerNode")?;

    ctor.new_instance(&[js_this])
}
    
#[js_function]
fn create_wave_shaper(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("WaveShaperNode")?;

    ctor.new_instance(&[js_this])
}
    

  