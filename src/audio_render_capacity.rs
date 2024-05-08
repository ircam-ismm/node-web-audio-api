use crate::*;

use napi::threadsafe_function::{ThreadSafeCallContext, ThreadsafeFunctionCallMode};
use napi::*;
use napi_derive::js_function;
use web_audio_api::{AudioRenderCapacity, AudioRenderCapacityEvent, AudioRenderCapacityOptions};

pub(crate) struct NapiAudioRenderCapacity(AudioRenderCapacity);

impl NapiAudioRenderCapacity {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioRenderCapacity",
            constructor,
            &[
                Property::new("start")?.with_method(start),
                Property::new("stop")?.with_method(stop),
                // Workaround to bind the `update` events to EventTarget.
                // This must be called from JS facade ctor as the JS handler are added to the Napi
                // object after its instantiation, and that we don't have any initial `resume` call.
                Property::new("listen_to_events")?.with_method(listen_to_events),
            ],
        )
    }

    pub fn unwrap(&mut self) -> &mut AudioRenderCapacity {
        &mut self.0
    }
}

// https://webaudio.github.io/web-audio-api/#AudioRenderCapacity
#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    js_this.define_properties(&[
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioRenderCapacity")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // create native node
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            audio_context.render_capacity()
        }
        &_ => unreachable!(),
    };

    // finalize instance creation
    let napi_node = NapiAudioRenderCapacity(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

#[js_function(1)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioRenderCapacity>(&js_this)?;
    let node = napi_node.unwrap();

    let js_options = ctx.get::<JsObject>(0)?;
    let update_interval = js_options
        .get_named_property::<JsNumber>("updateInterval")?
        .get_double()?;

    node.start(AudioRenderCapacityOptions { update_interval });

    ctx.env.get_undefined()
}

#[js_function]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioRenderCapacity>(&js_this)?;
    let node = napi_node.unwrap();

    node.stop();

    ctx.env.get_undefined()
}

#[js_function]
fn listen_to_events(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioRenderCapacity>(&js_this)?;
    let node = napi_node.unwrap();

    let k_onupdate = crate::utils::get_symbol_for(ctx.env, "node-web-audio-api:onupdate");
    let update_cb = js_this.get_property(k_onupdate).unwrap();
    let mut update_tsfn = ctx.env.create_threadsafe_function(
        &update_cb,
        0,
        |ctx: ThreadSafeCallContext<AudioRenderCapacityEvent>| {
            let event = ctx.value;
            let mut js_event = ctx.env.create_object()?;

            js_event.set_named_property("type", ctx.env.create_string("update"))?;
            js_event.set_named_property("timestamp", ctx.env.create_double(event.timestamp))?;
            js_event
                .set_named_property("averageLoad", ctx.env.create_double(event.average_load))?;
            js_event.set_named_property("peakLoad", ctx.env.create_double(event.peak_load))?;
            js_event
                .set_named_property("underrunRatio", ctx.env.create_double(event.underrun_ratio))?;

            Ok(vec![js_event])
        },
    )?;

    let _ = update_tsfn.unref(ctx.env);

    node.set_onupdate(move |e| {
        update_tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
    });

    ctx.env.get_undefined()
}
