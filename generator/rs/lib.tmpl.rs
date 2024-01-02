#![deny(clippy::all)]

use napi::{Env, JsObject, Result};
use napi_derive::module_exports;

// private
#[macro_use]
mod audio_node;

mod audio_param;
use crate::audio_param::{NapiAudioParam};
// public
mod audio_context;
use crate::audio_context::NapiAudioContext;
mod offline_audio_context;
use crate::offline_audio_context::NapiOfflineAudioContext;
mod audio_destination_node;
use crate::audio_destination_node::NapiAudioDestinationNode;
mod audio_listener;
use crate::audio_listener::NapiAudioListener;
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

mod media_streams;
use crate::media_streams::NapiMediaStream;

// Media devices API
mod media_devices;
use crate::media_devices::napi_enumerate_devices;
use crate::media_devices::napi_get_user_media;

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
    // @todo - catch all panics and throw clean JS Error
    // do not uncomment until it is clean as it swallow the error message and
    // makes things event more complicated...
    //
    // std::panic::set_hook(Box::new(|panic_info| {
    //     println!("{:?}", panic_info.payload());

    //     if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
    //         println!("panic occurred: {s:?}");
    //     } else {
    //         println!("panic occurred");
    //     }
    // }));


    // Store constructor for factory methods and internal instantiations
    // Note that we need to create the js class twice so that export and store
    // have both their owned constructor.
    // This could maybe be simplified in the future
    let mut store = env.create_object()?;

    let napi_class = NapiAudioContext::create_js_class(&env)?;
    exports.set_named_property("AudioContext", napi_class)?;

    let napi_class = NapiOfflineAudioContext::create_js_class(&env)?;
    exports.set_named_property("OfflineAudioContext", napi_class)?;

    // @todo - expose AudioParam as well

    // ----------------------------------------------------------------
    // special non node classes with private constructors
    // i.e. not exposed in export
    // ----------------------------------------------------------------
    let napi_class = NapiAudioDestinationNode::create_js_class(&env)?;
    store.set_named_property("AudioDestinationNode", napi_class)?;

    let napi_class = NapiAudioListener::create_js_class(&env)?;
    store.set_named_property("AudioListener", napi_class)?;

    // ----------------------------------------------------------------
    // special non node classes with public constructors
    // ----------------------------------------------------------------
    let napi_class = NapiAudioBuffer::create_js_class(&env)?;
    exports.set_named_property("AudioBuffer", napi_class)?;
    let napi_class = NapiAudioBuffer::create_js_class(&env)?;
    store.set_named_property("AudioBuffer", napi_class)?;

    let napi_class = NapiPeriodicWave::create_js_class(&env)?;
    exports.set_named_property("PeriodicWave", napi_class)?;
    let napi_class = NapiPeriodicWave::create_js_class(&env)?;
    store.set_named_property("PeriodicWave", napi_class)?;

    // ----------------------------------------------------------------
    // manually written nodes - AudioContext only
    // ----------------------------------------------------------------
    let napi_class = NapiMediaStreamAudioSourceNode::create_js_class(&env)?;
    exports.set_named_property("MediaStreamAudioSourceNode", napi_class)?;
    let napi_class = NapiMediaStreamAudioSourceNode::create_js_class(&env)?;
    store.set_named_property("MediaStreamAudioSourceNode", napi_class)?;

    // ----------------------------------------------------------------
    // generated audio nodes
    // ----------------------------------------------------------------
    ${d.nodes.map(n => { return `
    let napi_class = ${d.napiName(n)}::create_js_class(&env)?;
    exports.set_named_property("${d.name(n)}", napi_class)?;
    `}).join('')}


    // ----------------------------------------------------------------
    // MediaStream API & Media Devices API
    // ----------------------------------------------------------------
    let mut media_devices = env.create_object()?;

    let napi_class = NapiMediaStream::create_js_class(&env)?;
    media_devices.set_named_property("MediaStream", napi_class)?;
    let napi_class = NapiMediaStream::create_js_class(&env)?;
    store.set_named_property("MediaStream", napi_class)?;

    media_devices.create_named_method("enumerateDevices", napi_enumerate_devices)?;
    media_devices.create_named_method("getUserMedia", napi_get_user_media)?;
    // expose media devices
    exports.set_named_property("mediaDevices", media_devices)?;

    // store the store into instance so that it can be globally accessed
    let store_ref = env.create_reference(store)?;
    env.set_instance_data(store_ref, 0, |mut c| {
        // don't have any idea of what this does
        c.value.unref(c.env).unwrap();
    })?;

    Ok(())
}
