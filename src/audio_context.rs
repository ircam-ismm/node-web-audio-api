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

use std::collections::HashMap;
use std::io::Cursor;
use std::sync::{Arc, Mutex};

#[allow(unused_imports)]
// @todo - remove directive once OfflineAudioContext events are implemented
use napi::threadsafe_function::{
    ThreadSafeCallContext, ThreadsafeFunction, ThreadsafeFunctionCallMode,
};
use napi::*;
use napi_derive::js_function;
use uuid::Uuid;
use web_audio_api::context::*;
#[allow(unused_imports)]
// @todo - remove directive once OfflineAudioContext events are implemented
use web_audio_api::Event;

use crate::*;

#[derive(Clone)]
pub(crate) struct NapiAudioContext {
    context: Arc<AudioContext>,
    // store all ThreadsafeFunction created for listening to events
    // so that they can be aborted when the context is closed
    tsfn_store: Arc<Mutex<HashMap<String, ThreadsafeFunction<Event>>>>,
}

// for debug purpose
// impl Drop for NapiAudioContext {
//     fn drop(&mut self) {
//         println!("NAPI: NapiAudioContext dropped");
//     }
// }

impl NapiAudioContext {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioContext",
            constructor,
            &[
                Property::new("currentTime")?.with_getter(get_current_time),
                Property::new("sampleRate")?.with_getter(get_sample_rate),
                Property::new("listener")?.with_getter(get_listener),
                Property::new("state")?.with_getter(get_state),
                Property::new("decodeAudioData")?.with_method(decode_audio_data),
                // @todo - move to js?
                Property::new("createPeriodicWave")?.with_method(create_periodic_wave),
                Property::new("createBuffer")?.with_method(create_buffer),
                // ----------------------------------------------------
                // Methods and attributes specific to AudioContext
                // ----------------------------------------------------
                Property::new("baseLatency")?.with_getter(get_base_latency),
                Property::new("outputLatency")?.with_getter(get_output_latency),
                Property::new("sinkId")?.with_getter(get_sink_id),
                Property::new("setSinkId")?.with_method(set_sink_id),
                Property::new("resume")?.with_method(resume),
                Property::new("suspend")?.with_method(suspend),
                Property::new("close")?.with_method(close),
                // private
                Property::new("__initEventTarget__")?.with_method(init_event_target),
            ],
        )
    }

    pub fn unwrap(&self) -> &AudioContext {
        &self.context
    }

    pub fn store_thread_safe_listener(&self, tsfn: ThreadsafeFunction<Event>) -> String {
        let mut tsfn_store = self.tsfn_store.lock().unwrap();
        let uuid = Uuid::new_v4();
        tsfn_store.insert(uuid.to_string(), tsfn);

        uuid.to_string()
    }

    // We need to clean things around so that the js object can be garbage collected.
    // But we also need to wait so that the previous tsfn.call is executed,
    // this is not clean, but don't see how to implement that properly right now.

    // no ended events for nodes that are created by OfflineAudioContext
    // remove directive once implemented
    #[allow(dead_code)]
    pub fn clear_thread_safe_listener(&self, store_id: String) {
        std::thread::sleep(std::time::Duration::from_millis(1));
        let mut tsfn_store = self.tsfn_store.lock().unwrap();

        if let Some(tsfn) = tsfn_store.remove(&store_id) {
            let _ = tsfn.abort();
        }
    }

    pub fn clear_all_thread_safe_listeners(&self) {
        std::thread::sleep(std::time::Duration::from_millis(1));
        let mut tsfn_store = self.tsfn_store.lock().unwrap();

        for (_, tsfn) in tsfn_store.drain() {
            let _ = tsfn.abort();
        }
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // -------------------------------------------------
    // Parse options and create AudioContext
    // -------------------------------------------------
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
                    let latency = js_number.get_double()?;
                    AudioContextLatencyCategory::Custom(latency)
                }
            }
        } else {
            AudioContextLatencyCategory::Interactive
        };

        let sample_rate =
            if let Some(sample_rate_js) = options.get::<&str, JsNumber>("sampleRate")? {
                let sample_rate = sample_rate_js.get_double()? as f32;
                Some(sample_rate)
            } else {
                None
            };

        let sink_id_js = options.get::<&str, JsString>("sinkId")?;
        let sink_id = if let Some(sink_id_js) = sink_id_js {
            let sink_id_utf8 = sink_id_js.into_utf8()?.into_owned()?;
            sink_id_utf8.as_str().to_string()
        } else {
            String::new()
        };

        AudioContextOptions {
            latency_hint,
            sample_rate,
            sink_id,
            ..Default::default()
        }
    } else {
        AudioContextOptions::default()
    };

    let audio_context = AudioContext::new(audio_context_options);

    // -------------------------------------------------
    // Wrap context
    // -------------------------------------------------
    let napi_audio_context = NapiAudioContext {
        context: Arc::new(audio_context),
        tsfn_store: Arc::new(HashMap::new().into()),
    };
    ctx.env.wrap(&mut js_this, napi_audio_context)?;

    js_this.define_properties(&[
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioContext")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // test symbol as property name
    // let test_symbol = ctx.env.symbol_for("test").unwrap();
    // js_this.set_property(test_symbol, &ctx.env.create_string("test").unwrap())?;

    // -------------------------------------------------
    // Bind AudioDestination
    // -------------------------------------------------
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

    let current_time = obj.current_time();
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

// use a getter so we can lazily create the listener on first call and retrieve it afterward
#[js_function]
fn get_listener(ctx: CallContext) -> Result<JsObject> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // reproduce lazy instanciation strategy from rust crate
    if js_this.has_named_property("__listener__").ok().unwrap() {
        js_this.get_named_property("__listener__")
    } else {
        let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
        let store: JsObject = ctx.env.get_reference_value(store_ref)?;
        let ctor: JsFunction = store.get_named_property("AudioListener")?;
        let js_obj = ctor.new_instance(&[&js_this])?;
        js_this.set_named_property("__listener__", &js_obj)?;

        Ok(js_obj)
    }
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

// @todo - async version
#[js_function(1)]
fn decode_audio_data(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let context = napi_obj.unwrap();

    let js_buffer = ctx.get::<JsArrayBuffer>(0)?.into_value()?;
    let cursor = Cursor::new(js_buffer.to_vec());
    let audio_buffer = context.decode_audio_data_sync(cursor);

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
// Methods and attributes specific to AudioContext
// ----------------------------------------------------
#[js_function]
fn resume(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let clone = Arc::clone(&napi_obj.context);

    ctx.env.execute_tokio_future(
        async move {
            clone.resume().await;
            Ok(())
        },
        |&mut env, _val| env.get_undefined(),
    )
}

#[js_function]
fn suspend(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let clone = Arc::clone(&napi_obj.context);

    ctx.env.execute_tokio_future(
        async move {
            clone.suspend().await;
            Ok(())
        },
        |&mut env, _val| env.get_undefined(),
    )
}

#[js_function]
fn close(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let clone = Arc::clone(&napi_obj.context);

    ctx.env.execute_tokio_future(
        async move {
            clone.close().await;
            Ok(())
        },
        |&mut env, _val| env.get_undefined(),
    )
}

#[js_function]
fn get_base_latency(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let base_latency = obj.base_latency();
    ctx.env.create_double(base_latency)
}

#[js_function]
fn get_output_latency(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let output_latency = obj.output_latency();
    ctx.env.create_double(output_latency)
}

#[js_function]
fn get_sink_id(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let sink_id = obj.sink_id();
    ctx.env.create_string(&sink_id)
}

#[js_function(1)]
fn set_sink_id(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let sink_id_js = ctx.get::<JsString>(0)?;
    let sink_id = sink_id_js.into_utf8()?.into_owned()?;

    let res = obj.set_sink_id_sync(sink_id);

    if let Err(msg) = res {
        return Err(napi::Error::from_reason(msg.to_string()));
    }

    ctx.env.get_undefined()
}

// ----------------------------------------------------
// Private Event Target initialization
// ----------------------------------------------------
#[js_function]
fn init_event_target(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_context = ctx.env.unwrap::<NapiAudioContext>(&js_this)?;
    let context = napi_context.unwrap();

    let dispatch_event_symbol = ctx
        .env
        .symbol_for("node-web-audio-api:napi-dispatch-event")
        .unwrap();
    let js_func = js_this.get_property(dispatch_event_symbol).unwrap();

    let tsfn =
        ctx.env
            .create_threadsafe_function(&js_func, 0, |ctx: ThreadSafeCallContext<Event>| {
                let event_type = ctx.env.create_string(ctx.value.type_)?;
                Ok(vec![event_type])
            })?;

    let _ = napi_context.store_thread_safe_listener(tsfn.clone());

    {
        // statechange event
        let tsfn = tsfn.clone();
        let napi_context = napi_context.clone();

        context.set_onstatechange(move |e| {
            tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);

            if napi_context.unwrap().state() == AudioContextState::Closed {
                napi_context.clear_all_thread_safe_listeners();
            }
        });
    }

    {
        // sinkchange event
        let tsfn = tsfn.clone();

        context.set_onsinkchange(move |e| {
            tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
        });
    }

    ctx.env.get_undefined()
}
