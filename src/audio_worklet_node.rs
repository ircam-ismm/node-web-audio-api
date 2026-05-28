use std::cell::Cell;
use std::collections::HashMap;
use std::option::Option;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Arc, Mutex, OnceLock, RwLock};

use crossbeam_channel::{Receiver, Sender};

use napi::bindgen_prelude::*;
use napi::JsSymbol;
use napi_derive::napi;

use web_audio_api::node::{AudioNode, AudioNodeOptions, ChannelCountMode, ChannelInterpretation};
use web_audio_api::worklet::{
    AudioParamValues, AudioWorkletGlobalScope, AudioWorkletNode, AudioWorkletNodeOptions,
    AudioWorkletProcessor,
};
use web_audio_api::{AudioParamDescriptor, AutomationRate};

use crate::{NapiAudioContext, NapiAudioParam, NapiOfflineAudioContext};

/// Unique ID generator for AudioWorkletProcessors
static INCREMENTING_ID: AtomicU32 = AtomicU32::new(0);

/// Command issued from render thread to the Worker
enum WorkletCommand {
    Drop(u32),
    Process(ProcessorArguments),
}

/// Render thread to Worker processor arguments
struct ProcessorArguments {
    // processor unique ID
    id: u32,
    // processor inputs (unsafely cast to static)
    inputs: &'static [&'static [&'static [f32]]],
    // processor ouputs (unsafely cast to static)
    outputs: &'static [&'static [&'static [f32]]],
    // processor audio params (unsafely cast to static)
    param_values: &'static [(&'static str, &'static [f32])],
    // AudioWorkletGlobalScope currentTime
    current_time: f64,
    // AudioWorkletGlobalScope currentFrame
    current_frame: u64,
    // channel for tail_time return value
    tail_time_sender: Sender<bool>,
}

/// Message channel from render thread to Worker
struct ProcessCallChannel {
    send: Sender<WorkletCommand>,
    recv: Receiver<WorkletCommand>,
    // mark that the worklet has been exited to prevent any further `process` call
    exited: Arc<AtomicBool>,
}

/// Global map of ID -> ProcessCallChannel
///
/// Every (Offline)AudioContext is assigned a new channel + ID. The ID is passed to the
/// AudioWorklet Worker and to every AudioNode in the context so they can grab the channel and use
/// message passing.
static GLOBAL_PROCESS_CALL_CHANNEL_MAP: RwLock<Vec<ProcessCallChannel>> = RwLock::new(vec![]);

/// Request a new channel + ID for a newly created (Offline)AudioContext
pub(crate) fn allocate_process_call_channel() -> usize {
    // Only one process message can be sent at same time from a given context,
    // but Drop messages could be send too, so let's take some room
    let (send, recv) = crossbeam_channel::bounded(32);
    let channel = ProcessCallChannel {
        send,
        recv,
        exited: Arc::new(AtomicBool::new(false)),
    };

    // We need a write-lock to initialize the channel
    let mut write_lock = GLOBAL_PROCESS_CALL_CHANNEL_MAP.write().unwrap();
    let id = write_lock.len();
    write_lock.push(channel);

    id
}

/// Obtain the WorkletCommand sender for this context ID
fn process_call_sender(id: usize) -> Sender<WorkletCommand> {
    // optimistically assume the channel exists and we can use a shared read-lock
    GLOBAL_PROCESS_CALL_CHANNEL_MAP.read().unwrap()[id]
        .send
        .clone()
}

/// Obtain the WorkletCommand receiver for this context ID
fn process_call_receiver(id: usize) -> Receiver<WorkletCommand> {
    // optimistically assume the channel exists and we can use a shared read-lock
    GLOBAL_PROCESS_CALL_CHANNEL_MAP.read().unwrap()[id]
        .recv
        .clone()
}

/// Obtain the WorkletCommand exited flag for this context ID
fn process_call_exited(id: usize) -> Arc<AtomicBool> {
    // optimistically assume the channel exists and we can use a shared read-lock
    GLOBAL_PROCESS_CALL_CHANNEL_MAP.read().unwrap()[id]
        .exited
        .clone()
}

/// Message channel inside the control thread to pass param descriptors of a given AudioWorkletNode
/// into the static method AudioWorkletProcessor::parameter_descriptors
struct AudioParamDescriptorsChannel {
    send: Mutex<Sender<Vec<AudioParamDescriptor>>>,
    recv: Receiver<Vec<AudioParamDescriptor>>,
}

/// Generate the AudioParamDescriptorsChannel
///
/// It is shared by the whole application, so even by different AudioContexts. This is no issue
/// because it's using a Mutex to prevent concurrency.
fn audio_param_descriptor_channel() -> &'static AudioParamDescriptorsChannel {
    static PAIR: OnceLock<AudioParamDescriptorsChannel> = OnceLock::new();
    PAIR.get_or_init(|| {
        let (send, recv) = crossbeam_channel::unbounded();
        AudioParamDescriptorsChannel {
            send: Mutex::new(send),
            recv,
        }
    })
}

thread_local! {
    /// Denotes if the Worker thread priority has already been upped
    static HAS_THREAD_PRIO: Cell<bool> = const { Cell::new(false) };
}


/// Check that given JS and Rust input / output layout are the same,
/// i.e. that each input / output have the same number of channels
///
/// Note that we don't check the number of inputs / outputs as they are defined
/// at construction and cannot be changed
fn is_same_io_layout(js_io: &Array, rs_io: &'static [&'static [&'static [f32]]]) -> bool {
    for (i, rs_channels) in rs_io.iter().enumerate() {
        let js_channels = js_io.get::<Array>(i as u32);

        match js_channels {
            Ok(js_channels) => {
                match js_channels {
                    Some(js_channels) => {
                        if rs_channels.len() != js_channels.len() as usize {
                            return false;
                        }
                    }
                    None => return false, // found something but not an array
                }
            }
            Err(_) => return false, // could not grab channels at io index
        };
    }

    true
}

/// Recreate the JS inputs or output data structures (input and output are handled separately).
/// We must rebuild the whole structure from scratch because the resulting Arrays are frozen.
// @note: mini benchmarks have been made w/ an alternative JS implementation, was way slower
fn rebuild_io_layout<'a>(
    env: &'a Env,
    js_io: Array,
    rs_io: &'static [&'static [&'static [f32]]],
) -> Result<Array<'a>> {
    let mut new_js_io = env.create_array(rs_io.len() as u32).unwrap();

    let global = env.get_global()?;
    let k_worklet_get_buffer = env.symbol_for("node-web-audio-api:worklet-get-buffer")?;
    let get_buffer =
        global.get_property::<JsSymbol, Function<(), Float32Array>>(k_worklet_get_buffer)?;

    let k_worklet_recycle_buffer = env.symbol_for("node-web-audio-api:worklet-recycle-buffer")?;
    let recycle_buffer =
        global.get_property::<JsSymbol, Function<Float32Array, ()>>(k_worklet_recycle_buffer)?;

    let k_worklet_mark_as_untransferable =
        env.symbol_for("node-web-audio-api:worklet-mark-as-untransferable")?;
    let mark_as_untransferable = global
        .get_property::<JsSymbol, Function<Array, Array>>(k_worklet_mark_as_untransferable)?;

    for (i, io) in rs_io.iter().enumerate() {
        // recycle old channels
        let old_channels = js_io.get_element::<Array>(i as u32).unwrap();
        for j in 0..old_channels.get_array_length_unchecked()? {
            let channel = old_channels.get_element::<Float32Array>(j).unwrap();
            let _ = recycle_buffer.call(channel);
        }
        // create and populate new channels
        let mut channels = env.create_array(rs_io[i].len() as u32).unwrap();
        for j in 0..io.len() {
            let channel = get_buffer.call(())?;
            let _ = channels.set(j as u32, channel);
        }

        // mark channels as untransferable and freeze
        let mut channels = mark_as_untransferable.call(channels)?;
        let _ = channels.freeze();

        new_js_io.set(i as u32, channels).unwrap();
    }

    // mark input / output as untransferable and freeze
    let mut new_js_io = mark_as_untransferable.call(new_js_io)?;
    let _ = new_js_io.freeze();

    Ok(new_js_io)
}

/// Recycle all processor buffers on Drop
fn recycle_processor(env: &Env, processor: Object) -> Result<()> {
    let global = env.get_global()?;

    let k_worklet_recycle_buffer = env.symbol_for("node-web-audio-api:worklet-recycle-buffer")?;
    let recycle_buffer =
        global.get_property::<JsSymbol, Function<Float32Array, ()>>(k_worklet_recycle_buffer)?;

    let k_worklet_recycle_buffer_1 =
        env.symbol_for("node-web-audio-api:worklet-recycle-buffer-1")?;
    let recycle_buffer_1 =
        global.get_property::<JsSymbol, Function<Float32Array, ()>>(k_worklet_recycle_buffer_1)?;

    // recycle input channels
    let k_worklet_inputs = env.symbol_for("node-web-audio-api:worklet-inputs")?;
    let js_inputs = processor.get_property::<JsSymbol, Array>(k_worklet_inputs)?;

    for i in 0..js_inputs.len() {
        let input = js_inputs.get_element::<Array>(i)?;
        for j in 0..input.len() {
            let channel = input.get_element::<Float32Array>(j)?;
            let _ = recycle_buffer.call(channel);
        }
    }

    // recycle output channels
    let k_worklet_outputs = env.symbol_for("node-web-audio-api:worklet-outputs")?;
    let js_outputs = processor.get_property::<JsSymbol, Array>(k_worklet_outputs)?;

    for i in 0..js_outputs.len() {
        let output = js_outputs.get_element::<Array>(i)?;
        for j in 0..output.len() {
            let channel = output.get_element::<Float32Array>(j)?;
            let _ = recycle_buffer.call(channel);
        }
    }

    // recycle parameter buffers
    let k_worklet_params_cache = env.symbol_for("node-web-audio-api:worklet-params-cache")?;
    let js_params_cache = processor.get_property::<JsSymbol, Object>(k_worklet_params_cache)?;

    let js_params_properties = js_params_cache.get_property_names()?;
    let len = js_params_properties.get_array_length()?;

    for i in 0..len {
        let property_name: String = js_params_properties.get_element(i)?;
        let cache: Object = js_params_cache.get_named_property(&property_name)?;

        let param_cache_128 = cache.get_element::<Float32Array>(0)?;
        let _ = recycle_buffer.call(param_cache_128);

        let param_cache_1 = cache.get_element::<Float32Array>(1)?;
        let _ = recycle_buffer_1.call(param_cache_1);
    }

    Ok(())
}

/// Handle a AudioWorkletProcessor::process call in the Worker
fn process_audio_worklet(
    env: &Env,
    processors: &Object,
    processor_arguments: ProcessorArguments,
) -> Result<()> {
    let ProcessorArguments {
        id,
        inputs,
        outputs,
        param_values,
        current_time,
        current_frame,
        tail_time_sender,
    } = processor_arguments;

    let mut processor = match processors.get_named_property::<Object>(&id.to_string()) {
        Ok(processor) => processor,
        Err(_) => {
            // we may run into race conditions between Rust and JS, where processor
            // exists in Rust audio thread side but not yet on JS worker thread side
            let _ = tail_time_sender.send(true); // make sure we will be called back
            return Ok(());
        }
    };

    // Update AudioWorkletGlobalScope
    let mut global = env.get_global()?;
    global.set_named_property("currentTime", current_time)?;
    global.set_named_property("currentFrame", current_frame as f64)?;

    let k_worklet_callable_process =
        env.symbol_for("node-web-audio-api:worklet-callable-process")?;
    // Return early if worklet has been marked not callable,
    let callable_process = processor.get_property::<JsSymbol, bool>(k_worklet_callable_process)?;

    if !callable_process {
        let _ = tail_time_sender.send(false);
        return Ok(());
    }

    let render_quantum_size = global.get_named_property::<u32>("renderQuantumSize")? as usize;

    let k_worklet_inputs = env.symbol_for("node-web-audio-api:worklet-inputs")?;
    let mut js_inputs = processor.get_property::<JsSymbol, Array>(k_worklet_inputs)?;

    let k_worklet_outputs = env.symbol_for("node-web-audio-api:worklet-outputs")?;
    let mut js_outputs = processor.get_property::<JsSymbol, Array>(k_worklet_outputs)?;

    // <param_name, buffer>
    let k_worklet_params = env.symbol_for("node-web-audio-api:worklet-params")?;
    let mut js_params = processor.get_property::<JsSymbol, Object>(k_worklet_params)?;
    // <param_name, [Float32Array(128), Float32Array(1)]>
    let k_worklet_params_cache = env.symbol_for("node-web-audio-api:worklet-params-cache")?;
    let js_params_cache = processor.get_property::<JsSymbol, Object>(k_worklet_params_cache)?;

    // Check input and output channel layout, and rebuild JS object if something changed
    if !is_same_io_layout(&js_inputs, inputs) {
        let new_js_inputs = rebuild_io_layout(env, js_inputs, inputs)?;
        processor.set_property(k_worklet_inputs, new_js_inputs)?;
        js_inputs = processor.get_property::<JsSymbol, Array>(k_worklet_inputs)?;
    }

    if !is_same_io_layout(&js_outputs, outputs) {
        let new_js_outputs = rebuild_io_layout(env, js_outputs, outputs)?;
        processor.set_property(k_worklet_outputs, new_js_outputs)?;
        js_outputs = processor.get_property::<JsSymbol, Array>(k_worklet_outputs)?;
    }

    // Copy inputs into JS inputs buffers
    for (input_number, input) in inputs.iter().enumerate() {
        let js_input = js_inputs.get::<Array>(input_number as u32)?.unwrap();

        for (channel_number, channel) in input.iter().enumerate() {
            let mut js_channel = js_input
                .get::<Float32Array>(channel_number as u32)?
                .unwrap();
            let js_channel: &mut [f32] = unsafe { js_channel.as_mut() };
            js_channel.copy_from_slice(channel);
        }
    }

    // Clear output buffers
    // cf. wpt/webaudio/the-audio-api/the-audioworklet-interface/audioworkletprocessor-process-zero-outputs.https.html
    for (output_number, output) in outputs.iter().enumerate() {
        let js_output = js_outputs.get::<Array>(output_number as u32)?.unwrap();

        for (channel_number, _) in output.iter().enumerate() {
            let mut js_channel = js_output
                .get::<Float32Array>(channel_number as u32)?
                .unwrap();
            let js_channel: &mut [f32] = unsafe { js_channel.as_mut() };
            js_channel.fill(0.);
        }
    }

    // Copy params values into JS params buffers
    // @todo(perf) - We could rely on the fact that ParameterDescriptors
    // are ordered maps to avoid sending param names in `param_values`
    for (name, data) in param_values.iter() {
        let float32_arr_cache = js_params_cache.get_named_property::<Array>(name)?;
        // retrieve right Float32Array according to actual param size, i.e. 128 or 1
        let cache_index = if data.len() == 1 { 1 } else { 0 };
        let mut param_values = float32_arr_cache.get::<Float32Array>(cache_index)?.unwrap();
        // copy data into underlying ArrayBuffer
        let buffer: &mut [f32] = unsafe { param_values.as_mut() };
        buffer.copy_from_slice(data);
        // replace current values with new Float32Array
        js_params.set_named_property(name, param_values)?;
    }

    // The `process` method is executed indirectly because napi-rs `apply` implementation
    // retrieve the arguments as an array in the first argument, Then we need to unpack
    // them first (cf. `AudioWorkletProcessor[kWorkletUnpackProcess]`)
    let k_worklet_unpack_process = env.symbol_for("node-web-audio-api:worklet-unpack-process")?;

    // The `kWorkletUnpackProcess` wrapper function coerce value returned from `process`
    // to bool, if any error occurred in process, it has been catched in `kWorkletUnpackProcess``
    // which marked the processor has non-callable and returned false
    let unpack_process_function = processor
        .get_property::<JsSymbol, Function<(Array, Array, Object), bool>>(
            k_worklet_unpack_process,
        )?;

    let tail_time = unpack_process_function.apply(processor, (js_inputs, js_outputs, js_params))?;

    // copy JS output buffers back into outputs
    for (output_number, output) in outputs.iter().enumerate() {
        let js_output = js_outputs.get_element::<Array>(output_number as u32)?;

        for (channel_number, channel) in output.iter().enumerate() {
            let js_channel = js_output
                .get::<Float32Array>(channel_number as u32)?
                .unwrap();

            let src = js_channel.as_ptr();
            let dst = channel.as_ptr() as *mut f32;

            unsafe {
                std::ptr::copy_nonoverlapping(src, dst, render_quantum_size);
            }
        }
    }

    let _ = tail_time_sender.send(tail_time); // allowed to fail

    Ok(())
}

// #[allow(dead_code)]
// #[napi(js_name = "init_audio_worklet_global_scope")]
// pub fn init_audio_worklet_global_scope(env: Env, worklet_id: u32) {
//     // set thread priority
//     // init currentTime and currentFrame
//     todo!();
// }

/// The entry point into Rust from the Worker
#[allow(dead_code)]
#[napi(js_name = "run_audio_worklet_global_scope")]
pub fn run_audio_worklet_global_scope(env: Env, worklet_id: u32, mut processors: Object) {
    // Try set thread priority to highest on first call
    if !HAS_THREAD_PRIO.replace(true) {
        // allowed to fail
        let _ = thread_priority::set_current_thread_priority(thread_priority::ThreadPriority::Max);
    }

    // Poll for incoming commands and yield back to the event loop if there are none.
    // recv_timeout is not an option due to realtime safety, see discussion of
    // https://github.com/ircam-ismm/node-web-audio-api/pull/124#pullrequestreview-2053515583
    while let Ok(msg) = process_call_receiver(worklet_id as usize).try_recv() {
        match msg {
            WorkletCommand::Drop(id) => {
                match processors.get_named_property::<Object>(&id.to_string()) {
                    Ok(processor) => {
                        let _ = recycle_processor(&env, processor);
                        let _ = processors.delete_named_property(id.to_string());
                    }
                    Err(_) => {
                        println!(
                            "Cannot recycle process with id {:?}: processor not found",
                            id
                        );
                    }
                }
            }
            WorkletCommand::Process(processor_arguments) => {
                let _ = process_audio_worklet(&env, &processors, processor_arguments);
            }
        }
    }
}

#[allow(dead_code)]
#[napi(js_name = "exit_audio_worklet_global_scope")]
pub fn exit_audio_worklet_global_scope(worklet_id: u32) {
    let worklet_id = worklet_id as usize;
    // Flag message channel as exited to prevent any other render call
    process_call_exited(worklet_id).store(true, Ordering::SeqCst);
    // Handle any pending message from audio thread
    if let Ok(WorkletCommand::Process(args)) = process_call_receiver(worklet_id).try_recv() {
        let _ = args.tail_time_sender.send(false);
    }
}

#[napi(js_name = "NapiAudioWorkletNode")]
pub struct NapiAudioWorkletNode {
    pub(crate) inner: AudioWorkletNode,
    id: u32,
    // parameters: ObjectRef,
}

audio_node_impl!(NapiAudioWorkletNode);

#[napi]
impl NapiAudioWorkletNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        env: Env,
        mut this: This,
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        _name: String,
        options: Object,
        parameter_descriptors: Object,
    ) -> Self {
        // dictionary AudioWorkletNodeOptions : AudioNodeOptions {
        //     unsigned long numberOfInputs = 1;
        //     unsigned long numberOfOutputs = 1;
        //     sequence<unsigned long> outputChannelCount;
        //     record<DOMString, double> parameterData;
        //     object processorOptions;
        // };
        // --------------------------------------------------------
        // Parse options
        // --------------------------------------------------------
        let number_of_inputs = options.get::<u32>("numberOfInputs");
        let number_of_inputs = match number_of_inputs {
            Ok(number_of_inputs) => match number_of_inputs {
                Some(number_of_inputs) => number_of_inputs as usize,
                None => 1,
            },
            Err(_) => 1,
        };

        let number_of_outputs = options.get::<u32>("numberOfOutputs");
        let number_of_outputs = match number_of_outputs {
            Ok(number_of_outputs) => match number_of_outputs {
                Some(number_of_outputs) => number_of_outputs as usize,
                None => 1,
            },
            Err(_) => 1,
        };

        // algorithm https://webaudio.github.io/web-audio-api/#configuring-channels-with-audioworkletnodeoptions
        // is handled on JS side, let's just panic if something is wrong
        let output_channel_count = options.get::<&[u32]>("outputChannelCount");
        let output_channel_count = match output_channel_count {
            Ok(output_channel_count) => match output_channel_count {
                Some(output_channel_count) => {
                    output_channel_count.iter().map(|&v| v as usize).collect()
                }
                None => {
                    panic!("No default value for outputChannelCount in AudioWorkletNodeOptions ")
                }
            },
            Err(_) => panic!("No default value for outputChannelCount in AudioWorkletNodeOptions "),
        };

        // This is a list of user-defined key-value pairs that are used to set
        // the initial value of an AudioParam with the matched name in the AudioWorkletNode.
        let mut parameter_data = HashMap::<String, f64>::new();
        let parameter_data_js = options.get::<Object>("parameterData");
        let parameter_data_js = parameter_data_js.unwrap_or(Some(Object::new(&env).unwrap()));
        let parameter_data_js = parameter_data_js.unwrap_or(Object::new(&env).unwrap());
        let parameter_keys_js = parameter_data_js
            .get_all_property_names(
                KeyCollectionMode::OwnOnly,
                KeyFilter::Enumerable,
                KeyConversion::NumbersToStrings,
            )
            .unwrap();
        let length = parameter_keys_js.get_array_length().unwrap();

        for i in 0..length {
            let key = parameter_keys_js.get_element::<String>(i).unwrap();
            let value = parameter_data_js.get_named_property::<f64>(&key).unwrap();
            parameter_data.insert(key, value);
        }

        // `processorOptions` are directly sent to the JS processor
        // https://webaudio.github.io/web-audio-api/#dom-audioworkletnodeoptions-processoroptions

        // --------------------------------------------------------
        // Parse AudioNodeOptions
        // --------------------------------------------------------
        let audio_node_options_default = AudioNodeOptions::default();

        let some_channel_count = options.get::<u32>("channelCount").unwrap();
        let channel_count = if let Some(channel_count) = some_channel_count {
            channel_count as usize
        } else {
            audio_node_options_default.channel_count
        };

        let some_channel_count_mode = options.get::<String>("channelCountMode").unwrap();
        let channel_count_mode = if let Some(channel_count_mode) = some_channel_count_mode {
            match channel_count_mode.as_str() {
                "max" => ChannelCountMode::Max,
                "clamped-max" => ChannelCountMode::ClampedMax,
                "explicit" => ChannelCountMode::Explicit,
                _ => panic!("TypeError - Failed to read the 'channelCountMode' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelCountMode", channel_count_mode.as_str()),
            }
        } else {
            audio_node_options_default.channel_count_mode
        };

        let some_channel_interpretation = options.get::<String>("channelInterpretation").unwrap();
        let channel_interpretation = if let Some(channel_interpretation) =
            some_channel_interpretation
        {
            match channel_interpretation.as_str() {
                "speakers" => ChannelInterpretation::Speakers,
                "discrete" => ChannelInterpretation::Discrete,
                _ => panic!("TypeError - Failed to read the 'channelInterpretation' property from 'AudioNodeOptions': The provided value '{:?}' is not a valid enum value of type ChannelInterpretation", channel_interpretation.as_str()),
            }
        } else {
            audio_node_options_default.channel_interpretation
        };

        // --------------------------------------------------------
        // Parse ParameterDescriptors
        // --------------------------------------------------------
        let length = parameter_descriptors.get_array_length().unwrap();
        let mut parameter_descriptors_rs: Vec<web_audio_api::AudioParamDescriptor> =
            Vec::with_capacity(length as usize);

        for i in 0..length {
            let param = parameter_descriptors.get_element::<Object>(i).unwrap();

            let name = param.get_named_property::<String>("name").unwrap();
            let min_value = param.get_named_property::<f64>("minValue").unwrap() as f32;
            let max_value = param.get_named_property::<f64>("maxValue").unwrap() as f32;
            let default_value = param.get_named_property::<f64>("defaultValue").unwrap() as f32;

            let automation_rate = param
                .get_named_property::<String>("automationRate")
                .unwrap();
            let automation_rate = match automation_rate.as_str() {
                "a-rate" => AutomationRate::A,
                "k-rate" => AutomationRate::K,
                _ => unreachable!(),
            };

            let param_descriptor = AudioParamDescriptor {
                name,
                min_value,
                max_value,
                default_value,
                automation_rate,
            };

            parameter_descriptors_rs.insert(i as usize, param_descriptor);
        }

        let parameter_descriptors = parameter_descriptors_rs;

        // --------------------------------------------------------
        // Retrieve worklet Id
        // --------------------------------------------------------

        let worklet_id = match context {
            Either::A(context) => context.worklet_id,
            Either::B(context) => context.worklet_id,
        };

        // --------------------------------------------------------
        // Create AudioWorkletNodeOptions object
        // --------------------------------------------------------
        let id: u32 = INCREMENTING_ID.fetch_add(1, Ordering::Relaxed);

        let processor_options = NapiAudioWorkletProcessor {
            id,
            send: process_call_sender(worklet_id),
            exited: process_call_exited(worklet_id),
            tail_time_channel: crossbeam_channel::bounded(1),
            param_values: Vec::with_capacity(32),
        };

        let options = AudioWorkletNodeOptions {
            number_of_inputs,
            number_of_outputs,
            output_channel_count,
            parameter_data,
            audio_node_options: AudioNodeOptions {
                channel_count,
                channel_count_mode,
                channel_interpretation,
            },
            processor_options,
        };

        // --------------------------------------------------------
        // send parameterDescriptors so that NapiAudioWorkletProcessor
        // can retrieve them at construction
        // --------------------------------------------------------
        let guard = audio_param_descriptor_channel().send.lock().unwrap();
        guard.send(parameter_descriptors).unwrap();

        // --------------------------------------------------------
        // Create native AudioWorkletNode
        // --------------------------------------------------------
        let native_node = match context {
            Either::A(context) => {
                AudioWorkletNode::new::<NapiAudioWorkletProcessor>(context.inner(), options)
            }
            Either::B(context) => {
                AudioWorkletNode::new::<NapiAudioWorkletProcessor>(context.inner(), options)
            }
        };

        drop(guard);

        let mut parameters = Object::new(&env).unwrap();

        for (name, native_param) in native_node.parameters().iter() {
            let native_param = native_param.clone();
            let napi_param = NapiAudioParam::new(native_param);

            let _ = parameters.set_named_property(name, napi_param);
        }

        let _ = this.set_named_property("parameters", parameters);

        // finalize instance creation
        Self {
            inner: native_node,
            id,
        }
    }

    #[napi(getter)]
    pub fn id(&self) -> u32 {
        self.id
    }
}

// -------------------------------------------------
// AudioWorkletNode Interface
// -------------------------------------------------

struct NapiAudioWorkletProcessor {
    /// Unique id to pair Napi Worklet and JS processor
    id: u32,
    /// Sender to the JS Worklet
    send: Sender<WorkletCommand>,
    /// Flag that marks the JS worklet as exited
    exited: Arc<AtomicBool>,
    /// tail_time result channel
    tail_time_channel: (Sender<bool>, Receiver<bool>),
    /// Reusable Vec for AudioParam values
    param_values: Vec<(&'static str, &'static [f32])>,
}

impl AudioWorkletProcessor for NapiAudioWorkletProcessor {
    type ProcessorOptions = NapiAudioWorkletProcessor;

    fn constructor(opts: Self::ProcessorOptions) -> Self {
        opts // the opts contain the full processor
    }

    fn parameter_descriptors() -> Vec<AudioParamDescriptor>
    where
        Self: Sized,
    {
        // Get the values out of thin air, see `audio_param_descriptor_channel()` for details
        audio_param_descriptor_channel().recv.recv().unwrap()
    }

    fn process<'a, 'b>(
        &mut self,
        inputs: &'b [&'a [&'a [f32]]],
        outputs: &'b mut [&'a mut [&'a mut [f32]]],
        params: AudioParamValues<'b>,
        scope: &'b AudioWorkletGlobalScope,
    ) -> bool {
        // Early return if audio thread is still closing while worklet has been exited
        if self.exited.load(Ordering::SeqCst) {
            return false;
        }

        // SAFETY:
        // We are transmuting the a' and b' lifetimes to static in order to send them to the Worker
        // thread. This should be safe as long as:
        // - this function does not return before the Worker has finished using the slices
        // - the Worker / JS-code doesn't keep a copy of these slices - fingers crossed on this one

        let inputs: &'static [&'static [&'static [f32]]] = unsafe { std::mem::transmute(inputs) };
        let outputs: &'static [&'static [&'static [f32]]] = unsafe { std::mem::transmute(outputs) };

        self.param_values.clear();
        self.param_values.extend(params.keys().map(|k| {
            let label: &'static str = unsafe { std::mem::transmute(k) };
            let value: &'static [f32] = unsafe { std::mem::transmute(&params.get(k)[..]) };
            (label, value)
        }));
        let param_values: &'static [_] = unsafe { std::mem::transmute(&self.param_values[..]) };

        // end SAFETY comment

        let item = ProcessorArguments {
            id: self.id,
            inputs,
            outputs,
            param_values,
            current_time: scope.current_time,
            current_frame: scope.current_frame,
            tail_time_sender: self.tail_time_channel.0.clone(),
        };

        // send command to Worker
        self.send.send(WorkletCommand::Process(item)).unwrap();
        // await result
        self.tail_time_channel.1.recv().unwrap()
    }
}

impl Drop for NapiAudioWorkletProcessor {
    fn drop(&mut self) {
        if !self.exited.load(Ordering::SeqCst) {
            self.send.send(WorkletCommand::Drop(self.id)).unwrap();
        }
    }
}
