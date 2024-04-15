use std::io::Cursor;
use std::sync::Arc;

use napi::threadsafe_function::{ThreadSafeCallContext, ThreadsafeFunctionCallMode};
use napi::*;
use napi_derive::js_function;
use web_audio_api::context::*;
use web_audio_api::Event;

use crate::utils::{TsfnStore, WebAudioEventType};
use crate::*;

#[derive(Clone)]
pub(crate) struct NapiOfflineAudioContext {
    context: Arc<OfflineAudioContext>,
    // store all ThreadsafeFunction created for listening to events
    // so that they can be aborted when the context is closed
    tsfn_store: TsfnStore,
}

// for debug purpose
// impl Drop for NapiOfflineAudioContext {
//     fn drop(&mut self) {
//         println!("NAPI: NapiOfflineAudioContext dropped");
//     }
// }

impl NapiOfflineAudioContext {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = base_audio_context_interface![
            Property::new("length")?.with_getter(get_length),
            Property::new("startRendering")?.with_method(start_rendering),
            Property::new("resume")?.with_method(resume),
            Property::new("suspend")?.with_method(suspend),
            // [non spec] Bind with JS EventTarget
            Property::new("__initEventTarget__")?.with_method(init_event_target)
        ];

        env.define_class("OfflineAudioContext", constructor, &interface)
    }

    pub fn unwrap(&self) -> &OfflineAudioContext {
        &self.context
    }

    pub fn tsfn_store(&self) -> TsfnStore {
        self.tsfn_store.clone()
    }
}

#[js_function(3)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // -------------------------------------------------
    // Parse options and create OfflineAudioContext
    // -------------------------------------------------
    let number_of_channels = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    let length = ctx.get::<JsNumber>(1)?.get_double()? as usize;
    let sample_rate = ctx.get::<JsNumber>(2)?.get_double()? as f32;

    let audio_context = OfflineAudioContext::new(number_of_channels, length, sample_rate);

    // -------------------------------------------------
    // Wrap context
    // -------------------------------------------------
    let napi_audio_context = NapiOfflineAudioContext {
        context: Arc::new(audio_context),
        tsfn_store: TsfnStore::new(),
    };
    ctx.env.wrap(&mut js_this, napi_audio_context)?;

    js_this.define_properties(&[
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("OfflineAudioContext")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // -------------------------------------------------
    // Bind AudioDestination - requires Symbol.toStringTag
    // -------------------------------------------------
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioDestinationNode")?;
    let js_obj = ctor.new_instance(&[&js_this])?;
    js_this.set_named_property("destination", &js_obj)?;

    ctx.env.get_undefined()
}

base_audio_context_impl!(NapiOfflineAudioContext);

#[js_function]
fn get_length(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let obj = napi_obj.unwrap();

    let length = obj.length() as f64;
    ctx.env.create_double(length)
}

#[js_function]
fn start_rendering(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let clone = Arc::clone(&napi_obj.context);

    ctx.env.execute_tokio_future(
        async move {
            let audio_buffer = clone.start_rendering().await;
            Ok(audio_buffer)
        },
        |&mut env, audio_buffer| {
            // create js audio buffer instance
            let store_ref: &mut napi::Ref<()> = env.get_instance_data()?.unwrap();
            let store: JsObject = env.get_reference_value(store_ref)?;
            let ctor: JsFunction = store.get_named_property("AudioBuffer")?;
            // this should be cleaned
            let mut options = env.create_object()?;
            options.set("__internal_caller__", env.get_null())?;
            // populate with audio buffer
            let js_audio_buffer = ctor.new_instance(&[options])?;
            let napi_audio_buffer = env.unwrap::<NapiAudioBuffer>(&js_audio_buffer)?;
            napi_audio_buffer.populate(audio_buffer);

            Ok(js_audio_buffer)
        },
    )
}

#[js_function]
fn resume(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let clone = Arc::clone(&napi_obj.context);

    ctx.env.execute_tokio_future(
        async move {
            clone.resume().await;
            Ok(())
        },
        |&mut env, _val| env.get_undefined(),
    )
}

#[js_function(1)]
fn suspend(ctx: CallContext) -> Result<JsObject> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let clone = Arc::clone(&napi_obj.context);

    let when = ctx.get::<JsNumber>(0)?.get_double()?;

    ctx.env.execute_tokio_future(
        async move {
            clone.suspend(when).await;
            Ok(())
        },
        |&mut env, _val| env.get_undefined(),
    )
}

// ----------------------------------------------------------
// [non spec] Bind with JS EventTarget
// ----------------------------------------------------------
#[js_function]
fn init_event_target(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_context = ctx.env.unwrap::<NapiOfflineAudioContext>(&js_this)?;
    let context = napi_context.unwrap();

    let dispatch_event_symbol = ctx
        .env
        .symbol_for("node-web-audio-api:napi-dispatch-event")
        .unwrap();
    let js_func = js_this.get_property(dispatch_event_symbol).unwrap();

    let tsfn = ctx.env.create_threadsafe_function(
        &js_func,
        0,
        |ctx: ThreadSafeCallContext<WebAudioEventType>| {
            let native_event = ctx.value.unwrap_event();
            let event_type = ctx.env.create_string(native_event.type_)?;
            Ok(vec![event_type])
        },
    )?;

    let _ = napi_context.tsfn_store.add(tsfn.clone());

    context.set_onstatechange(move |e: Event| {
        let event = WebAudioEventType::from(e);
        tsfn.call(Ok(event), ThreadsafeFunctionCallMode::NonBlocking);
    });

    let napi_context = napi_context.clone();

    context.set_oncomplete(move |_e| {
        napi_context.tsfn_store.clear();
    });

    ctx.env.get_undefined()
}
