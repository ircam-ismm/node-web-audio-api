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

use napi::{Env, JsObject, Result};
use napi_derive::module_exports;

// private
#[macro_use]
mod audio_node;

mod audio_param;
use crate::audio_param::NapiAudioParam;
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

// import audio nodes (generated)

mod analyser_node;
use crate::analyser_node::NapiAnalyserNode;
mod audio_buffer_source_node;
use crate::audio_buffer_source_node::NapiAudioBufferSourceNode;
mod biquad_filter_node;
use crate::biquad_filter_node::NapiBiquadFilterNode;
mod channel_merger_node;
use crate::channel_merger_node::NapiChannelMergerNode;
mod channel_splitter_node;
use crate::channel_splitter_node::NapiChannelSplitterNode;
mod constant_source_node;
use crate::constant_source_node::NapiConstantSourceNode;
mod convolver_node;
use crate::convolver_node::NapiConvolverNode;
mod delay_node;
use crate::delay_node::NapiDelayNode;
mod dynamics_compressor_node;
use crate::dynamics_compressor_node::NapiDynamicsCompressorNode;
mod gain_node;
use crate::gain_node::NapiGainNode;
mod iir_filter_node;
use crate::iir_filter_node::NapiIIRFilterNode;
mod media_stream_audio_source_node;
use crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode;
mod oscillator_node;
use crate::oscillator_node::NapiOscillatorNode;
mod panner_node;
use crate::panner_node::NapiPannerNode;
mod stereo_panner_node;
use crate::stereo_panner_node::NapiStereoPannerNode;
mod wave_shaper_node;
use crate::wave_shaper_node::NapiWaveShaperNode;

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
    // Do not print panic messages, handle through JS errors
    std::panic::set_hook(Box::new(|_panic_info| {}));

    // Store constructors for factory methods and internal instantiations
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

    // ----------------------------------------------------------------
    // generated audio nodes
    // ----------------------------------------------------------------

    let napi_class = NapiAnalyserNode::create_js_class(&env)?;
    exports.set_named_property("AnalyserNode", napi_class)?;

    let napi_class = NapiAudioBufferSourceNode::create_js_class(&env)?;
    exports.set_named_property("AudioBufferSourceNode", napi_class)?;

    let napi_class = NapiBiquadFilterNode::create_js_class(&env)?;
    exports.set_named_property("BiquadFilterNode", napi_class)?;

    let napi_class = NapiChannelMergerNode::create_js_class(&env)?;
    exports.set_named_property("ChannelMergerNode", napi_class)?;

    let napi_class = NapiChannelSplitterNode::create_js_class(&env)?;
    exports.set_named_property("ChannelSplitterNode", napi_class)?;

    let napi_class = NapiConstantSourceNode::create_js_class(&env)?;
    exports.set_named_property("ConstantSourceNode", napi_class)?;

    let napi_class = NapiConvolverNode::create_js_class(&env)?;
    exports.set_named_property("ConvolverNode", napi_class)?;

    let napi_class = NapiDelayNode::create_js_class(&env)?;
    exports.set_named_property("DelayNode", napi_class)?;

    let napi_class = NapiDynamicsCompressorNode::create_js_class(&env)?;
    exports.set_named_property("DynamicsCompressorNode", napi_class)?;

    let napi_class = NapiGainNode::create_js_class(&env)?;
    exports.set_named_property("GainNode", napi_class)?;

    let napi_class = NapiIIRFilterNode::create_js_class(&env)?;
    exports.set_named_property("IIRFilterNode", napi_class)?;

    let napi_class = NapiMediaStreamAudioSourceNode::create_js_class(&env)?;
    exports.set_named_property("MediaStreamAudioSourceNode", napi_class)?;

    let napi_class = NapiOscillatorNode::create_js_class(&env)?;
    exports.set_named_property("OscillatorNode", napi_class)?;

    let napi_class = NapiPannerNode::create_js_class(&env)?;
    exports.set_named_property("PannerNode", napi_class)?;

    let napi_class = NapiStereoPannerNode::create_js_class(&env)?;
    exports.set_named_property("StereoPannerNode", napi_class)?;

    let napi_class = NapiWaveShaperNode::create_js_class(&env)?;
    exports.set_named_property("WaveShaperNode", napi_class)?;

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
