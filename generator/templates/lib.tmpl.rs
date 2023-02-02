#![deny(clippy::all)]

use napi::{Env, JsObject, Result};
use napi_derive::module_exports;

// private
#[macro_use]
mod audio_node;

mod audio_param;
use crate::audio_param::{NapiAudioParam, ParamGetter};
// public
mod audio_context;
use crate::audio_context::NapiAudioContext;
mod offline_audio_context;
use crate::offline_audio_context::NapiOfflineAudioContext;
mod audio_destination_node;
use crate::audio_destination_node::NapiAudioDestinationNode;
mod audio_buffer;
use crate::audio_buffer::NapiAudioBuffer;
mod periodic_wave;
use crate::periodic_wave::NapiPeriodicWave;

// manually written nodes
mod media_stream_audio_source_node;
use crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode;

// import audio nodes (generated)
${d.nodes.map(n => { return `
mod ${d.slug(n)};
use crate::${d.slug(n)}::${d.napiName(n)};`}).join('')}

// proto media devices API (monkey patched on the JS side)
mod media_devices;
use crate::media_devices::NapiMicrophone;

#[cfg(all(
    any(windows, unix),
    target_arch = "x86_64",
    not(target_env = "musl"),
    not(debug_assertions)
))]
#[global_allocator]
static ALLOC: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[module_exports]
fn init(mut exports: JsObject, env: Env) -> Result<()> {
    // catch all panics
    std::panic::set_hook(Box::new(|panic_info| {
        println!("{:?}", panic_info.payload());

        if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            println!("panic occurred: {s:?}");
        } else {
            println!("panic occurred");
        }
    }));


    // store constructor for factory methods
    // @note - we create the js class twice so that export and store have both
    // their owned constructor. Maybe this could be cleaned...
    let mut store = env.create_object()?;

    let napi_class = NapiAudioContext::create_js_class(&env)?;
    exports.set_named_property("AudioContext", napi_class)?;

    let napi_class = NapiOfflineAudioContext::create_js_class(&env)?;
    exports.set_named_property("OfflineAudioContext", napi_class)?;

    // @note - do not expose in exports until we know how to make the constructor private
    // let napi_class = NapiAudioDestinationNode::create_js_class(&env)?;
    // exports.set_named_property("AudioDestinationNode", napi_class)?;
    let napi_class = NapiAudioDestinationNode::create_js_class(&env)?;
    store.set_named_property("AudioDestinationNode", napi_class)?;

    let napi_class = NapiAudioBuffer::create_js_class(&env)?;
    exports.set_named_property("AudioBuffer", napi_class)?;
    let napi_class = NapiAudioBuffer::create_js_class(&env)?;
    store.set_named_property("AudioBuffer", napi_class)?;

    let napi_class = NapiPeriodicWave::create_js_class(&env)?;
    exports.set_named_property("PeriodicWave", napi_class)?;
    let napi_class = NapiPeriodicWave::create_js_class(&env)?;
    store.set_named_property("PeriodicWave", napi_class)?;

    // manually written nodes
    let napi_class = NapiMediaStreamAudioSourceNode::create_js_class(&env)?;
    exports.set_named_property("MediaStreamAudioSourceNode", napi_class)?;
    let napi_class = NapiMediaStreamAudioSourceNode::create_js_class(&env)?;
    store.set_named_property("MediaStreamAudioSourceNode", napi_class)?;

    // export audio nodes (generated)
    ${d.nodes.map(n => { return `
    let napi_class = ${d.napiName(n)}::create_js_class(&env)?;
    exports.set_named_property("${d.name(n)}", napi_class)?;
    let napi_class = ${d.napiName(n)}::create_js_class(&env)?;
    store.set_named_property("${d.name(n)}", napi_class)?;
    `}).join('')}


    // proto media devices API (monkey patched on the JS side)
    let napi_class = NapiMicrophone::create_js_class(&env)?;
    exports.set_named_property("Microphone", napi_class)?;

    // store the store into instance so that it can be globally accessed
    let store_ref = env.create_reference(store)?;
    env.set_instance_data(store_ref, 0, |mut c| {
        // don't have any idea of what this does
        c.value.unref(c.env).unwrap();
    })?;

    Ok(())
}
