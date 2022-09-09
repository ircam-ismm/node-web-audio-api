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
                Property::new("Symbol.toStringTag")?
                    .with_value(&env.create_string("AudioContext")?)
                    .with_property_attributes(PropertyAttributes::Static),

                Property::new("currentTime")?.with_getter(get_current_time),
                Property::new("sampleRate")?.with_getter(get_sample_rate),
                Property::new("state")?.with_getter(get_state),

                // for now async methods are sync, from a JS perpspective the
                // API will nonetheless be the same... (see monkey-patch.js)
                Property::new("resume")?.with_method(resume),
                Property::new("suspend")?.with_method(suspend),
                Property::new("close")?.with_method(close),
                Property::new("decodeAudioData")?.with_method(decode_audio_data),

                Property::new("createBuffer")?.with_method(create_buffer),

                // ----------------------------------------------------
                // Factory methods
                // ----------------------------------------------------
                ${d.nodes.map(n => {
                    let factory = d.factoryName(n);
                    return `
                Property::new("${factory}")?.with_method(${d.slug(factory)}),`
                }).join('')}
            ],
        )
    }

    pub fn unwrap(&self) -> &AudioContext {
        &self.0
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // parse AudioContext options
    let options_js: Option<JsObject> = ctx.try_get::<JsObject>(0)?.into();
    let audio_context_options = if let Some(options) = options_js {
        // LatencyHint
        let latency_hint = if let Some(latency_hint_js) =
            options.get::<&str, Either<JsString, JsNumber>>("latencyHint")?
        {
            match latency_hint_js {
                Either::A(js_string) => {
                    let uf8_category = js_string.into_utf8()?.into_owned()?;
                    let category = &uf8_category[..];

                    match category {
                        "interactive" => AudioContextLatencyCategory::Interactive,
                        "balanced" => AudioContextLatencyCategory::Balanced,
                        "playback" => AudioContextLatencyCategory::Playback,
                        _ => AudioContextLatencyCategory::Interactive, // default
                    }
                }
                Either::B(js_number) => {
                    let latency = js_number.get_double()? as f64;
                    AudioContextLatencyCategory::Custom(latency)
                }
            }
        } else {
            AudioContextLatencyCategory::Interactive
        };

        // SampleRate
        let sample_rate =
            if let Some(sample_rate_js) = options.get::<&str, JsNumber>("sampleRate")? {
                let sample_rate = sample_rate_js.get_double()? as f32;
                Some(sample_rate)
            } else {
                None
            };

        AudioContextOptions {
            latency_hint,
            sample_rate,
        }
    } else {
        AudioContextOptions::default()
    };

    let audio_context = AudioContext::new(audio_context_options);
    let napi_audio_context = NapiAudioContext(audio_context);
    ctx.env.wrap(&mut js_this, napi_audio_context)?;

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
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let current_time = obj.current_time() as f64;
    ctx.env.create_double(current_time)
}

#[js_function]
fn get_sample_rate(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let sample_rate = obj.sample_rate() as f64;
    ctx.env.create_double(sample_rate)
}

#[js_function]
fn get_state(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let state = obj.state();
    let state_str = match state {
        AudioContextState::Suspended => "suspended",
        AudioContextState::Running => "running",
        AudioContextState::Closed => "closed",
    };

    ctx.env.create_string(state_str)
}

// ----------------------------------------------------
// METHODS
// ----------------------------------------------------
${['resume', 'suspend', 'close'].map(method => `
// @todo - async version
#[js_function]
fn ${method}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    obj.${method}_sync();

    ctx.env.get_undefined()
}
`).join('')}

// @todo - async version
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
    let audio_buffer = context.decode_audio_data_sync(file).unwrap();

    // create js audio buffer instance
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioBuffer")?;
    let mut options = ctx.env.create_object()?;
    options.set("__decode_audio_data_caller__", ctx.env.get_null())?;

    // populate with audio buffer
    let js_audio_buffer = ctor.new_instance(&[options])?;
    let napi_audio_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_audio_buffer)?;
    napi_audio_buffer.populate(audio_buffer);

    Ok(js_audio_buffer)
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

// ----------------------------------------------------
// Factory methods
// ----------------------------------------------------
${d.nodes.map(n => {
    let factory = d.factoryName(n);
    return `
#[js_function]
fn ${d.slug(factory)}(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("${d.name(n)}")?;

    ctor.new_instance(&[js_this])
}
    `;
}).join('')}
