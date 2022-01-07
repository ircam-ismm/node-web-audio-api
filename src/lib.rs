#![deny(clippy::all)]

use napi::{Env, JsObject, Result};
use napi_derive::module_exports;

#[macro_use]
mod audio_node;

mod audio_buffer_source_node;
use crate::audio_buffer_source_node::NapiAudioBufferSourceNode;
mod audio_context;
use crate::audio_context::NapiAudioContext;
mod audio_destination_node;
// use crate::audio_destination_node::NapiAudioDestinationNode;
mod audio_param;
// use crate::audio_param::NapiAudioParam;
mod gain_node;
use crate::gain_node::NapiGainNode;
mod oscillator_node;
use crate::oscillator_node::NapiOscillatorNode;

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
    // store constructor for factory methods
    // @note - we create the js class twice so that export and store have both
    // their owned constructor. Maybe this could be cleaned...
    let mut store = env.create_object()?;

    let napi_class = NapiAudioContext::create_js_class(&env)?;
    exports.set_named_property("AudioContext", napi_class)?;

    let napi_class = NapiGainNode::create_js_class(&env)?;
    exports.set_named_property("GainNode", napi_class)?;
    let napi_class = NapiGainNode::create_js_class(&env)?;
    store.set_named_property("GainNode", napi_class)?;

    let napi_class = NapiOscillatorNode::create_js_class(&env)?;
    exports.set_named_property("OscillatorNode", napi_class)?;
    let napi_class = NapiOscillatorNode::create_js_class(&env)?;
    store.set_named_property("OscillatorNode", napi_class)?;

    // store the store into instance so that it can be globally accessed
    let store_ref = env.create_reference(store)?;
    env.set_instance_data(store_ref, 0, |mut c| {
        // don't have any idea of what this does
        c.value.unref(c.env).unwrap();
    })?;

    Ok(())
}
