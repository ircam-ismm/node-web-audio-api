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
// mod audio_render_capacity;
// use crate::audio_render_capacity::NapiAudioRenderCapacity;

// Generated audio nodes

mod analyser_node;
// use crate::analyser_node::NapiAnalyserNode;
mod audio_buffer_source_node;
// use crate::audio_buffer_source_node::NapiAudioBufferSourceNode;
mod biquad_filter_node;
// use crate::biquad_filter_node::NapiBiquadFilterNode;
mod channel_merger_node;
// use crate::channel_merger_node::NapiChannelMergerNode;
mod channel_splitter_node;
// use crate::channel_splitter_node::NapiChannelSplitterNode;
mod constant_source_node;
// use crate::constant_source_node::NapiConstantSourceNode;
mod convolver_node;
// use crate::convolver_node::NapiConvolverNode;
mod delay_node;
// use crate::delay_node::NapiDelayNode;
mod dynamics_compressor_node;
// use crate::dynamics_compressor_node::NapiDynamicsCompressorNode;
mod gain_node;
// use crate::gain_node::NapiGainNode;
mod iir_filter_node;
// use crate::iir_filter_node::NapiIIRFilterNode;
mod media_stream_audio_source_node;
// use crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode;
mod oscillator_node;
// use crate::oscillator_node::NapiOscillatorNode;
mod panner_node;
// use crate::panner_node::NapiPannerNode;
mod stereo_panner_node;
// use crate::stereo_panner_node::NapiStereoPannerNode;
mod wave_shaper_node;
// use crate::wave_shaper_node::NapiWaveShaperNode;

// AudioWorklet internals
// use crate::audio_worklet_node::{
//     exit_audio_worklet_global_scope,
//     run_audio_worklet_global_scope,
// };

// MediaDevices & MediaStream API
mod media_devices;
mod media_streams;

#[napi_derive::module_init]
fn init() {
    // Do not print panic messages, handle through JS errors
    std::panic::set_hook(Box::new(|_panic_info| {}));
}
