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
                // Property::new("Symbol.toStringTag")?
                //     .with_value(&env.create_string("OfflineAudioContext")?)
                //     .with_property_attributes(PropertyAttributes::Static),

                Property::new("currentTime")?.with_getter(get_current_time),
                Property::new("sampleRate")?.with_getter(get_sample_rate),
                // Property::new("state")?.with_getter(get_state),
                // Property::new("baseLatency")?.with_getter(get_base_latency),
                // Property::new("outputLatency")?.with_getter(get_output_latency),

                // for now async methods are sync, from a JS perpspective the
                // API will nonetheless be the same... (see monkey-patch.js)
                Property::new("startRendering")?.with_method(start_rendering),
                // Property::new("resume")?.with_method(resume),
                // Property::new("suspend")?.with_method(suspend),
                // Property::new("close")?.with_method(close),
                // Property::new("decodeAudioData")?.with_method(decode_audio_data),
                Property::new("createPeriodicWave")?.with_method(create_periodic_wave),

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
        None => {
            Err(napi::Error::from_reason("startRendering already called".to_string()))
        },
    }
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
        },
        Err(e) => {
            Err(napi::Error::from_reason(e.to_string()))
        },
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
            if let Some(disable_nomalization) = constraints_js.get::<&str, JsBoolean>("disableNormalization")? {
                disable_nomalization
            } else {
                ctx.env.get_boolean(false)?
            }
        },
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
${d.nodes.map(n => {
    let factoryName = d.factoryName(n);
    let factoryIdl = d.factoryIdl(factoryName);
    let args = factoryIdl.arguments;

    return `
#[js_function(${args.length})]
fn ${d.slug(factoryName)}(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();

    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("${d.name(n)}")?;

    ${args.length > 0 ?
        `let mut options = ctx.env.create_object()?;
        ${args.map((arg, index) => {
            switch (arg.idlType.idlType) {
                case 'unsigned long': // channel merger, channel spiller
                case 'double': // delay
                    return `
    match ctx.try_get::<JsNumber>(${index})? {
        Either::A(value) => options.set("${arg.name}", value)?,
        Either::B(_) => ()
    }
                `
                    break;
                default:
                    // IIR Filter
                    if (arg.idlType.generic == 'sequence' &&  arg.idlType.idlType[0].idlType === 'double') {
                        return `
                            match ctx.try_get::<JsTypedArray>(${index})? {
                                Either::A(value) => options.set("${arg.name}", value)?,
                                Either::B(_) => ()
                            }
                        `
                    } else {
                        console.log(`[factory] argument ${idl.name} for ${factoryName} not parsed`);
                    }

                    break;
        }}).join('')}
    ctor.new_instance(&[js_this, options])` : `ctor.new_instance(&[js_this])`
    }
}
    `;
}).join('')}
