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
mod analyser_node;
mod audio_buffer_source_node;
mod audio_worklet_node;
mod biquad_filter_node;
mod channel_merger_node;
mod channel_splitter_node;
mod constant_source_node;
mod convolver_node;
mod delay_node;
mod dynamics_compressor_node;
mod gain_node;
mod iir_filter_node;
mod media_stream_audio_source_node;
mod oscillator_node;
mod panner_node;
mod script_processor_node;
mod stereo_panner_node;
mod wave_shaper_node;

// MediaDevices & MediaStream API
mod media_devices;
mod media_streams;

#[napi_derive::module_init]
fn init() {
    // Do not print panic messages, handle through JS errors
    std::panic::set_hook(Box::new(|_panic_info| {}));
}
