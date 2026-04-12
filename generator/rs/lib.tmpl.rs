#![deny(clippy::all)]

#[macro_use]
mod base_audio_context;
#[macro_use]
mod audio_node;

// Web Audio API
mod audio_context;
use crate::audio_context::NapiAudioContext;
mod offline_audio_context;
use crate::offline_audio_context::NapiOfflineAudioContext;
mod events;
use crate::events::*;

mod audio_destination_node;
use crate::audio_destination_node::NapiAudioDestinationNode;
mod audio_param;
use crate::audio_param::NapiAudioParam;
mod audio_buffer;
use crate::audio_buffer::NapiAudioBuffer;
mod periodic_wave;
use crate::periodic_wave::NapiPeriodicWave;
mod audio_listener;
use crate::audio_listener::NapiAudioListener;
mod audio_render_capacity;
use crate::audio_render_capacity::NapiAudioRenderCapacity;

// Generated audio nodes
${d.nodes.map(n => { return `
mod ${d.slug(n)};
// use crate::${d.slug(n)}::${d.napiName(n)};`}).join('')}

// AudioWorklet internals
use crate::audio_worklet_node::{
    exit_audio_worklet_global_scope,
    run_audio_worklet_global_scope,
};

// MediaDevices & MediaStream API
mod media_streams;
mod media_devices;


#[napi_derive::module_init]
fn init() {
    // Do not print panic messages, handle through JS errors
    std::panic::set_hook(Box::new(|_panic_info| {}));
}

