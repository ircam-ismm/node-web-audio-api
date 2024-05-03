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

use napi::{Env, JsFunction, JsNumber, JsObject, JsString, JsUndefined, JsUnknown, Result};
use napi_derive::{module_exports, napi};

use crossbeam_channel::{self, Receiver, Sender};
use std::sync::{Mutex, OnceLock};

use web_audio_api::AudioParamDescriptor;

// channel from main to worker
pub(crate) struct SendItem(*mut f32, *mut f32);
unsafe impl Send for SendItem {}
pub(crate) fn send_recv_pair(
) -> &'static Mutex<(Option<Sender<SendItem>>, Option<Receiver<SendItem>>)> {
    static PAIR: OnceLock<Mutex<(Option<Sender<SendItem>>, Option<Receiver<SendItem>>)>> =
        OnceLock::new();
    PAIR.get_or_init(|| {
        let (send, recv) = crossbeam_channel::unbounded();
        Mutex::new((Some(send), Some(recv)))
    })
}

// channel from worker to main
pub(crate) struct SendItem2(Vec<AudioParamDescriptor>);
pub(crate) fn send_recv_pair2() -> &'static (Sender<SendItem2>, Receiver<SendItem2>) {
    static PAIR: OnceLock<(Sender<SendItem2>, Receiver<SendItem2>)> = OnceLock::new();
    PAIR.get_or_init(|| crossbeam_channel::unbounded())
}

#[napi]
pub fn register_params(env: Env, params: Vec<JsObject>) -> Result<JsUndefined> {
    let rs_params: Vec<_> = params
        .into_iter()
        .map(|param| {
            let js_name = param
                .get_property::<_, JsString>(env.create_string("name").unwrap())
                .unwrap();
            let utf8_name = js_name.into_utf8().unwrap();
            let name = utf8_name.into_owned().unwrap();
            let min_value = param
                .get_property::<_, JsNumber>(env.create_string("minValue").unwrap())
                .unwrap()
                .get_double()
                .unwrap() as f32;
            let max_value = param
                .get_property::<_, JsNumber>(env.create_string("maxValue").unwrap())
                .unwrap()
                .get_double()
                .unwrap() as f32;
            let default_value = param
                .get_property::<_, JsNumber>(env.create_string("defaultValue").unwrap())
                .unwrap()
                .get_double()
                .unwrap() as f32;

            web_audio_api::AudioParamDescriptor {
                name,
                min_value,
                max_value,
                default_value,
                automation_rate: web_audio_api::AutomationRate::A,
            }
        })
        .collect();
    send_recv_pair2().0.send(SendItem2(rs_params)).unwrap();
    env.get_undefined()
}

#[napi]
pub fn run_audio_worklet(env: Env) -> Result<JsUndefined> {
    println!("inside rust worklet");
    let recv = send_recv_pair().lock().unwrap().1.take().unwrap();
    for item in recv {
        let proc = env
            .get_global()?
            .get_property::<_, JsObject>(env.create_string("proc123")?)?;
        let process = proc.get_property::<_, JsFunction>(env.create_string("process")?)?;

        let input_samples = crate::utils::float_buffer_to_js(&env, item.0, 128);
        let mut input_channels = env.create_array(0)?;
        input_channels.insert(input_samples)?;
        let mut inputs = env.create_array(0)?;
        inputs.insert(input_channels)?;

        let output_samples = crate::utils::float_buffer_to_js(&env, item.1, 128);
        let mut output_channels = env.create_array(0)?;
        output_channels.insert(output_samples)?;
        let mut outputs = env.create_array(0)?;
        outputs.insert(output_channels)?;

        let js_ret: JsUnknown = process.apply3(proc, inputs, outputs, env.create_array(128)?)?;
        let _ret = js_ret.coerce_to_bool()?.get_value()?;
    }
    env.get_undefined()
}

#[macro_use]
mod base_audio_context;
#[macro_use]
mod audio_node;

// halpers
mod utils;
// Web Audio API
mod audio_context;
use crate::audio_context::NapiAudioContext;
mod audio_destination_node;
use crate::audio_destination_node::NapiAudioDestinationNode;
mod audio_param;
use crate::audio_param::NapiAudioParam;
mod audio_listener;
use crate::audio_listener::NapiAudioListener;
mod audio_buffer;
use crate::audio_buffer::NapiAudioBuffer;
mod periodic_wave;
use crate::periodic_wave::NapiPeriodicWave;
mod offline_audio_context;
use crate::offline_audio_context::NapiOfflineAudioContext;
// Generated audio nodes

mod script_processor_node;
use crate::script_processor_node::NapiScriptProcessorNode;
mod audio_worklet_node;
use crate::audio_worklet_node::NapiAudioWorkletNode;
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

// MediaDevices & MediaStream API
mod media_streams;
use crate::media_streams::NapiMediaStream;
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

    let napi_class = NapiAudioContext::create_js_class(&env)?;
    exports.set_named_property("AudioContext", napi_class)?;

    let napi_class = NapiOfflineAudioContext::create_js_class(&env)?;
    exports.set_named_property("OfflineAudioContext", napi_class)?;

    let napi_class = NapiAudioBuffer::create_js_class(&env)?;
    exports.set_named_property("AudioBuffer", napi_class)?;

    let napi_class = NapiPeriodicWave::create_js_class(&env)?;
    exports.set_named_property("PeriodicWave", napi_class)?;

    let napi_class = NapiMediaStreamAudioSourceNode::create_js_class(&env)?;
    exports.set_named_property("MediaStreamAudioSourceNode", napi_class)?;

    // ----------------------------------------------------------------
    // Generated audio nodes
    // ----------------------------------------------------------------

    let napi_class = NapiScriptProcessorNode::create_js_class(&env)?;
    exports.set_named_property("ScriptProcessorNode", napi_class)?;

    let napi_class = NapiAudioWorkletNode::create_js_class(&env)?;
    exports.set_named_property("AudioWorkletNode", napi_class)?;

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

    media_devices.create_named_method("enumerateDevices", napi_enumerate_devices)?;
    media_devices.create_named_method("getUserMedia", napi_get_user_media)?;
    // expose media devices
    exports.set_named_property("mediaDevices", media_devices)?;

    // ----------------------------------------------------------------
    // Store constructors for classes that need to be created from within Rust code
    // ----------------------------------------------------------------
    let mut store = env.create_object()?;

    let napi_class = NapiAudioDestinationNode::create_js_class(&env)?;
    store.set_named_property("AudioDestinationNode", napi_class)?;

    let napi_class = NapiAudioListener::create_js_class(&env)?;
    store.set_named_property("AudioListener", napi_class)?;

    let napi_class = NapiAudioBuffer::create_js_class(&env)?;
    store.set_named_property("AudioBuffer", napi_class)?;

    let napi_class = NapiMediaStream::create_js_class(&env)?;
    store.set_named_property("MediaStream", napi_class)?;

    // store the store into instance so that it can be globally accessed
    let store_ref = env.create_reference(store)?;
    env.set_instance_data(store_ref, 0, |mut c| {
        // don't have any idea of what this does
        c.value.unref(c.env).unwrap();
    })?;

    Ok(())
}
