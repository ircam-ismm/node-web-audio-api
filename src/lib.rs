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

// use napi::{Env, JsObject, Result};
// use napi_derive::module_exports;

#[macro_use]
mod base_audio_context;
#[macro_use]
mod audio_node;

// halpers
// mod utils;
// Web Audio API
mod audio_context;
use crate::audio_context::NapiAudioContext;
mod offline_audio_context;
use crate::offline_audio_context::NapiOfflineAudioContext;

mod audio_destination_node;
use crate::audio_destination_node::NapiAudioDestinationNode;
mod audio_param;
use crate::audio_param::NapiAudioParam;
mod audio_buffer;
use crate::audio_buffer::NapiAudioBuffer;
mod periodic_wave;
use crate::periodic_wave::NapiPeriodicWave;
// mod audio_listener;
// use crate::audio_listener::NapiAudioListener;
// mod audio_render_capacity;
// use crate::audio_render_capacity::NapiAudioRenderCapacity;

// Generated audio nodes

mod audio_buffer_source_node;
// use crate::audio_buffer_source_node::NapiAudioBufferSourceNode;
mod gain_node;
// use crate::gain_node::NapiGainNode;
mod oscillator_node;
// use crate::oscillator_node::NapiOscillatorNode;

// AudioWorklet internals
// use crate::audio_worklet_node::{
//     exit_audio_worklet_global_scope,
//     run_audio_worklet_global_scope,
// };

// MediaDevices & MediaStream API
// mod media_streams;
// use crate::media_streams::NapiMediaStream;
// mod media_devices;
// use crate::media_devices::napi_enumerate_devices;
// use crate::media_devices::napi_get_user_media;
