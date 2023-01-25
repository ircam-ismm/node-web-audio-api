// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use std::fs::File;

use napi::*;
use napi_derive::js_function;
use web_audio_api::context::*;

use crate::*;

pub(crate) struct NapiOfflineAudioContext(Option<OfflineAudioContext>);

impl NapiOfflineAudioContext {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "OfflineAudioContext",
            constructor,
            &[
                Property::new("currentTime")?.with_getter(get_current_time),
                Property::new("sampleRate")?.with_getter(get_sample_rate),
                // this should be implemented for offline as well
                // see https://webaudio.github.io/web-audio-api/#dom-baseaudiocontext-state
                // Property::new("state")?.with_getter(get_state),
                Property::new("decodeAudioData")?.with_method(decode_audio_data),
                Property::new("createPeriodicWave")?.with_method(create_periodic_wave),
                Property::new("createBuffer")?.with_method(create_buffer),
                // ----------------------------------------------------
                // Factory methods
                // ----------------------------------------------------
                Property::new("createAnalyser")?.with_method(create_analyser),
                Property::new("createBufferSource")?.with_method(create_buffer_source),
                Property::new("createBiquadFilter")?.with_method(create_biquad_filter),
                Property::new("createChannelMerger")?.with_method(create_channel_merger),
                Property::new("createChannelSplitter")?.with_method(create_channel_splitter),
                Property::new("createConstantSource")?.with_method(create_constant_source),
                Property::new("createConvolver")?.with_method(create_convolver),
                Property::new("createDelay")?.with_method(create_delay),
                Property::new("createDynamicsCompressor")?.with_method(create_dynamics_compressor),
                Property::new("createGain")?.with_method(create_gain),
                Property::new("createIIRFilter")?.with_method(create_iir_filter),
                Property::new("createOscillator")?.with_method(create_oscillator),
                Property::new("createPanner")?.with_method(create_panner),
                Property::new("createStereoPanner")?.with_method(create_stereo_panner),
                Property::new("createWaveShaper")?.with_method(create_wave_shaper),
                // ----------------------------------------------------
                // Methods and attributes specifc to OfflineAudioContext
                // ----------------------------------------------------
                Property::new("startRendering")?.with_method(start_rendering),
            ],
        )
    }

    pub fn unwrap(&self) -> &OfflineAudioContext {
        &self.0.as_ref().unwrap()
    }
}

#[js_function(3)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let number_of_channels = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    let length = ctx.get::<JsNumber>(1)?.get_double()? as usize;
    let sample_rate = ctx.get::<JsNumber>(2)?.get_double()? as f32;

    let audio_context = OfflineAudioContext::new(number_of_channels, length, sample_rate);
    let napi_audio_context = NapiOfflineAudioContext(Some(audio_context));
    ctx.env.wrap(&mut js_this, napi_audio_context)?;

    js_this.define_properties(&[
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("OfflineAudioContext")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // Audio Destination
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioDestinationNode")?;
    let js_obj = ctor.new_instance(&[&js_this])?;
    js_this.set_named_property("destination", &js_obj)?;

    ctx.env.get_undefined()
}

#[js_function]
fn get_current_time(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let current_time = obj.current_time() as f64;
    ctx.env.create_double(current_time)
}

#[js_function]
fn get_sample_rate(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let sample_rate = obj.sample_rate() as f64;
    ctx.env.create_double(sample_rate)
}

// @todo - async version
#[js_function(1)]
fn decode_audio_data(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let context = napi_obj.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let js_path = js_obj.get_named_property::<JsString>("path")?;
    let uf8_path = js_path.into_utf8()?.into_owned()?;
    let str_path = &uf8_path[..];

    let file = File::open(str_path).unwrap();
    let audio_buffer = context.decode_audio_data_sync(file);

    match audio_buffer {
        Ok(audio_buffer) => {
            // create js audio buffer instance
            let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
            let store: JsObject = ctx.env.get_reference_value(store_ref)?;
            let ctor: JsFunction = store.get_named_property("AudioBuffer")?;
            let mut options = ctx.env.create_object()?;
            options.set("__internal_caller__", ctx.env.get_null())?;

            // populate with audio buffer
            let js_audio_buffer = ctor.new_instance(&[options])?;
            let napi_audio_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_audio_buffer)?;
            napi_audio_buffer.populate(audio_buffer);

            Ok(js_audio_buffer)
        }
        Err(e) => Err(napi::Error::from_reason(e.to_string())),
    }
}

#[js_function(3)]
fn create_buffer(ctx: CallContext) -> Result<JsObject> {
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioBuffer")?;

    let number_of_channels = ctx.get::<JsNumber>(0)?;
    let length = ctx.get::<JsNumber>(1)?;
    let sample_rate = ctx.get::<JsNumber>(2)?;

    let mut options = ctx.env.create_object()?;
    options.set("numberOfChannels", number_of_channels)?;
    options.set("length", length)?;
    options.set("sampleRate", sample_rate)?;

    ctor.new_instance(&[options])
}

#[js_function(3)]
fn create_periodic_wave(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("PeriodicWave")?;

    let real = ctx.get::<JsTypedArray>(0)?;
    let imag = ctx.get::<JsTypedArray>(1)?;
    // this differ slightly from the spec
    let disable_normalization = match ctx.try_get::<JsObject>(2)? {
        Either::A(constraints_js) => {
            if let Some(disable_nomalization) =
                constraints_js.get::<&str, JsBoolean>("disableNormalization")?
            {
                disable_nomalization
            } else {
                ctx.env.get_boolean(false)?
            }
        }
        Either::B(_) => ctx.env.get_boolean(false)?,
    };

    let mut options = ctx.env.create_object()?;
    options.set("real", real)?;
    options.set("imag", imag)?;
    options.set("disableNormalization", disable_normalization)?;

    ctor.new_instance(&[js_this, options])
}

// ----------------------------------------------------
// Factory methods
// ----------------------------------------------------

#[js_function(0)]
fn create_analyser(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AnalyserNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(0)]
fn create_buffer_source(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioBufferSourceNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(0)]
fn create_biquad_filter(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("BiquadFilterNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(1)]
fn create_channel_merger(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("ChannelMergerNode")?;

    let mut options = ctx.env.create_object()?;

    match ctx.try_get::<JsNumber>(0)? {
        Either::A(value) => options.set("numberOfInputs", value)?,
        Either::B(_) => (),
    }

    ctor.new_instance(&[js_this, options])
}

#[js_function(1)]
fn create_channel_splitter(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("ChannelSplitterNode")?;

    let mut options = ctx.env.create_object()?;

    match ctx.try_get::<JsNumber>(0)? {
        Either::A(value) => options.set("numberOfOutputs", value)?,
        Either::B(_) => (),
    }

    ctor.new_instance(&[js_this, options])
}

#[js_function(0)]
fn create_constant_source(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("ConstantSourceNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(0)]
fn create_convolver(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("ConvolverNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(1)]
fn create_delay(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("DelayNode")?;

    let mut options = ctx.env.create_object()?;

    match ctx.try_get::<JsNumber>(0)? {
        Either::A(value) => options.set("maxDelayTime", value)?,
        Either::B(_) => (),
    }

    ctor.new_instance(&[js_this, options])
}

#[js_function(0)]
fn create_dynamics_compressor(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("DynamicsCompressorNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(0)]
fn create_gain(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("GainNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(2)]
fn create_iir_filter(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("IIRFilterNode")?;

    let mut options = ctx.env.create_object()?;

    match ctx.try_get::<JsTypedArray>(0)? {
        Either::A(value) => options.set("feedforward", value)?,
        Either::B(_) => (),
    }

    match ctx.try_get::<JsTypedArray>(1)? {
        Either::A(value) => options.set("feedback", value)?,
        Either::B(_) => (),
    }

    ctor.new_instance(&[js_this, options])
}

#[js_function(0)]
fn create_oscillator(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("OscillatorNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(0)]
fn create_panner(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("PannerNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(0)]
fn create_stereo_panner(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("StereoPannerNode")?;

    ctor.new_instance(&[js_this])
}

#[js_function(0)]
fn create_wave_shaper(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("WaveShaperNode")?;

    ctor.new_instance(&[js_this])
}

// ----------------------------------------------------
// Methods specific to OfflineAudioContext
// ----------------------------------------------------

// @todo - async version
#[js_function]
fn start_rendering(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let some_audio_context = napi_obj.0.take();

    match some_audio_context {
        Some(audio_context) => {
            let audio_buffer = audio_context.start_rendering_sync();

            // create js audio buffer instance
            let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
            let store: JsObject = ctx.env.get_reference_value(store_ref)?;
            let ctor: JsFunction = store.get_named_property("AudioBuffer")?;
            let mut options = ctx.env.create_object()?;
            options.set("__internal_caller__", ctx.env.get_null())?;

            // populate with audio buffer
            let js_audio_buffer = ctor.new_instance(&[options])?;
            let napi_audio_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_audio_buffer)?;
            napi_audio_buffer.populate(audio_buffer);

            Ok(js_audio_buffer)
        }
        None => Err(napi::Error::from_reason(
            "startRendering already called".to_string(),
        )),
    }
}
