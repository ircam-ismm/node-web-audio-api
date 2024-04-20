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

use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;

pub(crate) struct NapiConstantSourceNode(ConstantSourceNode);

// for debug purpose
impl Drop for NapiConstantSourceNode {
    fn drop(&mut self) {
        println!("NAPI: NapiConstantSourceNode dropped");
    }
}

impl NapiConstantSourceNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("start")?.with_method(start),
            Property::new("stop")?.with_method(stop),
            Property::new("clear_ended_callback")?.with_method(clear_ended_callback)
        ];

        env.define_class("ConstantSourceNode", constructor, &interface)
    }

    // @note: this is used in audio_node.rs for the connect / disconnect macros
    pub fn unwrap(&mut self) -> &mut ConstantSourceNode {
        &mut self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse ConstantSourceOptions
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

    let offset = js_options
        .get::<&str, JsNumber>("offset")?
        .unwrap()
        .get_double()? as f32;

    // --------------------------------------------------------
    // Create ConstantSourceOptions object
    // --------------------------------------------------------
    let options = ConstantSourceOptions { offset };

    // --------------------------------------------------------
    // Create native ConstantSourceNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ConstantSourceNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ConstantSourceNode::new(audio_context, options)
        }
        &_ => unreachable!(),
    };

    // --------------------------------------------------------
    // Bind AudioParam to JS object
    // --------------------------------------------------------
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("AudioParam")?;

    let native_param = native_node.offset().clone();
    let js_obj = ctor.new_instance(&[&js_this])?;
    let napi_obj = ctx.env.unwrap::<NapiAudioParam>(&js_obj)?;
    napi_obj.wrap(native_param);
    // ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("offset", &js_obj)?;

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("ConstantSourceNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiConstantSourceNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiConstantSourceNode);

// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
fn listen_to_ended_event(
    env: &Env,
    js_this: &JsObject,
    node: &mut ConstantSourceNode,
) -> Result<()> {
    use std::sync::{Arc, Mutex};

    use napi::threadsafe_function::{ThreadSafeCallContext, ThreadsafeFunctionCallMode};
    use web_audio_api::Event;

    let k_onended = get_symbol_for(env, "node-web-audio-api:onended");
    let ended_cb = js_this.get_property(k_onended).unwrap();
    let mut ended_tsfn =
        env.create_threadsafe_function(&ended_cb, 0, |ctx: ThreadSafeCallContext<Event>| {
            let mut event = ctx.env.create_object()?;
            let event_type = ctx.env.create_string(ctx.value.type_)?;
            event.set_named_property("type", event_type)?;

            Ok(vec![event])
        })?;

    // unref tsfn so they do not prevent the process to exit
    // let _ = ended_tsfn.unref(env);
    let ended_tsfn_mutex = Arc::new(Mutex::new(ended_tsfn.clone()));

    node.set_onended(move |e| {
        ended_tsfn.call(Ok(e), ThreadsafeFunctionCallMode::Blocking);
        // even with unref, if the tsfn is not aborted, the node cannot
        // be garbage collected
        std::thread::sleep(std::time::Duration::from_micros(100));
        let ended_tsfn = ended_tsfn_mutex.lock().unwrap();
        let _ = ended_tsfn.clone().abort();
    });

    Ok(())
}

#[js_function]
fn clear_ended_callback(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    // node.clear_onended();

    ctx.env.get_undefined()
}

#[js_function(1)]
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    listen_to_ended_event(ctx.env, &js_this, node)?;

    let when = ctx.get::<JsNumber>(0)?.get_double()?;
    node.start_at(when);

    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiConstantSourceNode>(&js_this)?;
    let node = napi_node.unwrap();

    let when = ctx.get::<JsNumber>(0)?.get_double()?;
    node.stop_at(when);

    ctx.env.get_undefined()
}
