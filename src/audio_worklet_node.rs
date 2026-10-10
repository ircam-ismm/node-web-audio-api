use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::option::Option;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Arc, Mutex, OnceLock, RwLock};
use std::time::{Duration, Instant};

use crossbeam_channel::{Receiver, Sender};

use napi::bindgen_prelude::*;
use napi::{JsSymbol, SymbolRef};
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

/// Worker reply to a process call
enum ProcessReply {
    /// The call ran, or the processor cannot run anymore, with its tail time
    Done(bool),
    /// The JS processor does not exist yet, the call did not run
    NotReady,
}

/// Render thread to Worker processor arguments
struct ProcessorArguments {
    // processor unique ID
    id: u32,
    // processor inputs (unsafely cast to static)
    inputs: &'static [&'static [&'static [f32]]],
    // processor ouputs (unsafely cast to static)
    outputs: &'static [&'static [&'static [f32]]],
    // processor audio params in descriptor order (unsafely cast to static)
    param_values: &'static [&'static [f32]],
    // whether a param switched between a single value and a full render quantum
    param_sizes_changed: bool,
    // AudioWorkletGlobalScope currentTime
    current_time: f64,
    // AudioWorkletGlobalScope currentFrame
    current_frame: u64,
    // channel for the reply
    reply_sender: Sender<ProcessReply>,
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

/// How long the Worker keeps polling for the next command after handling one
const POLL_AFTER_COMMAND: Duration = Duration::from_micros(50);

/// Upper bound on one `run_audio_worklet_global_scope` call, so that the event loop
/// (MessagePort, exit) still runs when an OfflineAudioContext renders without pause
const MAX_TIME_OUTSIDE_EVENT_LOOP: Duration = Duration::from_millis(1);

/// How long the render thread polls for the reply of a `process` call before blocking
const SPIN_FOR_REPLY: Duration = Duration::from_micros(30);

thread_local! {
    /// Denotes if the Worker thread priority has already been upped
    static HAS_THREAD_PRIO: Cell<bool> = const { Cell::new(false) };
    /// AudioWorkletGlobalScope currentFrame last written in the Worker
    static GLOBAL_SCOPE_FRAME: Cell<Option<u64>> = const { Cell::new(None) };
    /// AudioWorkletGlobalScope renderQuantumSize, read once per Worker
    static RENDER_QUANTUM_SIZE: Cell<usize> = const { Cell::new(0) };
    /// References to the symbols read on every process call
    static SYMBOL_REFS: RefCell<HashMap<&'static str, SymbolRef<false>>> = RefCell::new(HashMap::new());
}

/// `env.symbol_for` through a reference created once per Worker: `Symbol.for`
/// builds a string and searches the registry each time
fn cached_symbol_for<'env>(env: &'env Env, description: &'static str) -> Result<JsSymbol<'env>> {
    SYMBOL_REFS.with_borrow_mut(|refs| {
        if let Some(symbol_ref) = refs.get(description) {
            return symbol_ref.get_value(env);
        }

        let symbol = env.symbol_for(description)?;
        refs.insert(description, symbol.create_ref::<false>()?);
        Ok(symbol)
    })
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

    Ok(())
}

/// Silence the outputs of a process call that could not run
fn silence_outputs(outputs: &'static [&'static [&'static [f32]]]) {
    for output in outputs {
        for channel in output.iter() {
            unsafe {
                std::ptr::write_bytes(channel.as_ptr() as *mut f32, 0, channel.len());
            }
        }
    }
}

/// Clear the JS exception a failed N-API call may leave pending, every later
/// N-API call in this Worker fails until it is cleared
fn clear_pending_exception(env: &Env) {
    let mut exception = std::ptr::null_mut();
    unsafe {
        napi::sys::napi_get_and_clear_last_exception(env.raw(), &mut exception);
    }
}

/// Put a processor whose call could not run in the error state, as if `process` threw
fn mark_processor_errored(env: &Env, processors: &Object, id: u32, error: Error) -> Result<()> {
    let Some(processor) = processors.get_element::<Option<Object>>(id)? else {
        return Ok(());
    };

    let k_worklet_mark_non_callable_process =
        env.symbol_for("node-web-audio-api:worklet-mark-non-callable-process")?;
    let mark_non_callable_process = processor
        .get_property::<JsSymbol, Function<FnArgs<(&str, Object)>, ()>>(
            k_worklet_mark_non_callable_process,
        )?;

    let js_error = env.create_error(error)?;
    mark_non_callable_process.apply(
        processor,
        ("node-web-audio-api:worklet:process-error", js_error).into(),
    )
}

/// Handle a AudioWorkletProcessor::process call in the Worker, returns the tail time
fn process_audio_worklet(
    env: &Env,
    processors: &Object,
    processor_arguments: &ProcessorArguments,
) -> Result<ProcessReply> {
    let &ProcessorArguments {
        id,
        inputs,
        outputs,
        param_values,
        param_sizes_changed,
        current_time,
        current_frame,
        ..
    } = processor_arguments;

    let mut processor = match processors.get_element::<Option<Object>>(id) {
        Ok(Some(processor)) => processor,
        _ => {
            // we may run into race conditions between Rust and JS, where processor
            // exists in Rust audio thread side but not yet on JS worker thread side
            return Ok(ProcessReply::NotReady); // make sure we will be called back
        }
    };

    // Update AudioWorkletGlobalScope, once per render quantum
    if GLOBAL_SCOPE_FRAME.get() != Some(current_frame) {
        let mut global = env.get_global()?;
        global.set_named_property("currentTime", current_time)?;
        global.set_named_property("currentFrame", current_frame as f64)?;
        GLOBAL_SCOPE_FRAME.set(Some(current_frame));
    }

    let k_worklet_callable_process =
        cached_symbol_for(env, "node-web-audio-api:worklet-callable-process")?;
    // Return early if worklet has been marked not callable,
    let callable_process = processor.get_property::<JsSymbol, bool>(k_worklet_callable_process)?;

    if !callable_process {
        return Ok(ProcessReply::Done(false));
    }

    if RENDER_QUANTUM_SIZE.get() == 0 {
        let global = env.get_global()?;
        let size = global.get_named_property::<u32>("renderQuantumSize")?;
        RENDER_QUANTUM_SIZE.set(size as usize);
    }
    let render_quantum_size = RENDER_QUANTUM_SIZE.get();

    let k_worklet_inputs = cached_symbol_for(env, "node-web-audio-api:worklet-inputs")?;
    let mut js_inputs = processor.get_property::<JsSymbol, Array>(k_worklet_inputs)?;

    let k_worklet_outputs = cached_symbol_for(env, "node-web-audio-api:worklet-outputs")?;
    let mut js_outputs = processor.get_property::<JsSymbol, Array>(k_worklet_outputs)?;

    // <param_name, buffer>
    let k_worklet_params = cached_symbol_for(env, "node-web-audio-api:worklet-params")?;
    let mut js_params = processor.get_property::<JsSymbol, Object>(k_worklet_params)?;

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

    // Copy params values into the JS params buffer, which holds `render_quantum_size + 1`
    // values per param in descriptor order: a full render quantum, then a single value
    if !param_values.is_empty() {
        let k_worklet_params_buffer =
            cached_symbol_for(env, "node-web-audio-api:worklet-params-buffer")?;
        let mut js_params_buffer =
            processor.get_property::<JsSymbol, Float32Array>(k_worklet_params_buffer)?;
        let params_buffer: &mut [f32] = unsafe { js_params_buffer.as_mut() };
        let stride = render_quantum_size + 1;

        for (index, data) in param_values.iter().enumerate() {
            let offset = index * stride
                + if data.len() == 1 {
                    render_quantum_size
                } else {
                    0
                };

            if let Some(values) = params_buffer.get_mut(offset..offset + data.len()) {
                values.copy_from_slice(data);
            }
        }

        // Point each `parameters[name]` to the view matching the param size,
        // which only changes when automations start or stop
        if param_sizes_changed {
            let k_worklet_params_names =
                env.symbol_for("node-web-audio-api:worklet-params-names")?;
            let names = processor.get_property::<JsSymbol, Array>(k_worklet_params_names)?;
            let k_worklet_params_views =
                env.symbol_for("node-web-audio-api:worklet-params-views")?;
            let views = processor.get_property::<JsSymbol, Array>(k_worklet_params_views)?;

            for (index, data) in param_values.iter().enumerate() {
                let name = names.get_element::<String>(index as u32)?;
                let view_index = 2 * index + if data.len() == 1 { 1 } else { 0 };
                let view = views.get_element::<Float32Array>(view_index as u32)?;
                js_params.set_named_property(&name, view)?;
            }
        }
    }

    let k_worklet_unpack_process =
        cached_symbol_for(env, "node-web-audio-api:worklet-unpack-process")?;

    // The `kWorkletUnpackProcess` wrapper function coerce value returned from `process`
    // to bool, if any error occurred in process, it has been catched in `kWorkletUnpackProcess``
    // which marked the processor has non-callable and returned false
    let unpack_process_function = processor
        .get_property::<JsSymbol, Function<FnArgs<(Array, Array, Object)>, bool>>(
            k_worklet_unpack_process,
        )?;

    let tail_time =
        unpack_process_function.apply(processor, (js_inputs, js_outputs, js_params).into())?;

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

    Ok(ProcessReply::Done(tail_time))
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
    //
    // Once a command has been handled, keep polling for a short while: the next
    // worklet of the same render quantum usually follows within microseconds, while
    // a turn of the event loop costs more than a whole `process` call. The event
    // loop then runs about once per render quantum instead of once per call.
    let receiver = process_call_receiver(worklet_id as usize);
    let entered_at = Instant::now();
    let mut poll_until: Option<Instant> = None;

    loop {
        let msg = match receiver.try_recv() {
            Ok(msg) => msg,
            Err(_) => match poll_until {
                Some(deadline) if Instant::now() < deadline => {
                    std::hint::spin_loop();
                    continue;
                }
                _ => break,
            },
        };

        match msg {
            WorkletCommand::Drop(id) => match processors.get_element::<Option<Object>>(id) {
                Ok(Some(processor)) => {
                    if recycle_processor(&env, processor).is_err() {
                        clear_pending_exception(&env);
                    }
                    let _ = processors.delete_element(id);
                }
                _ => {
                    println!(
                        "Cannot recycle process with id {:?}: processor not found",
                        id
                    );
                }
            },
            WorkletCommand::Process(processor_arguments) => {
                // The render thread waits for this reply, so it must be sent even
                // when the call could not run
                let reply = process_audio_worklet(&env, &processors, &processor_arguments)
                    .unwrap_or_else(|error| {
                        clear_pending_exception(&env);
                        silence_outputs(processor_arguments.outputs);
                        let marked = mark_processor_errored(
                            &env,
                            &processors,
                            processor_arguments.id,
                            error,
                        );
                        if marked.is_err() {
                            clear_pending_exception(&env);
                        }
                        ProcessReply::Done(false)
                    });
                let _ = processor_arguments.reply_sender.send(reply); // allowed to fail
            }
        }

        let now = Instant::now();
        if now.duration_since(entered_at) > MAX_TIME_OUTSIDE_EVENT_LOOP {
            break;
        }
        poll_until = Some(now + POLL_AFTER_COMMAND);
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
        let _ = args.reply_sender.send(ProcessReply::Done(false));
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
        let param_count = parameter_descriptors.len();

        let processor_options = NapiAudioWorkletProcessor {
            id,
            send: process_call_sender(worklet_id),
            exited: process_call_exited(worklet_id),
            reply_channel: crossbeam_channel::bounded(1),
            param_names: parameter_descriptors
                .iter()
                .map(|d| d.name.clone())
                .collect(),
            param_values: Vec::with_capacity(param_count),
            param_sizes: vec![0; param_count],
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
    /// Reply channel of process calls
    reply_channel: (Sender<ProcessReply>, Receiver<ProcessReply>),
    /// AudioParam names in descriptor order, the order the JS side expects values in
    param_names: Vec<String>,
    /// Reusable Vec for AudioParam values
    param_values: Vec<&'static [f32]>,
    /// AudioParam value sizes of the previous call, 0 before the first one
    param_sizes: Vec<usize>,
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

        let mut param_sizes_changed = false;
        self.param_values.clear();

        for (name, size) in self.param_names.iter().zip(self.param_sizes.iter_mut()) {
            let value: &'static [f32] = unsafe { std::mem::transmute(&params.get(name)[..]) };

            if *size != value.len() {
                *size = value.len();
                param_sizes_changed = true;
            }

            self.param_values.push(value);
        }

        let param_values: &'static [_] = unsafe { std::mem::transmute(&self.param_values[..]) };

        // end SAFETY comment

        let item = ProcessorArguments {
            id: self.id,
            inputs,
            outputs,
            param_values,
            param_sizes_changed,
            current_time: scope.current_time,
            current_frame: scope.current_frame,
            reply_sender: self.reply_channel.0.clone(),
        };

        // send command to Worker
        self.send.send(WorkletCommand::Process(item)).unwrap();

        // await result, polling first: a call usually completes within a few
        // microseconds, and waking a parked render thread costs about as much
        let receiver = &self.reply_channel.1;
        let spin_until = Instant::now() + SPIN_FOR_REPLY;

        let reply = loop {
            if let Ok(reply) = receiver.try_recv() {
                break reply;
            }

            if Instant::now() >= spin_until {
                break receiver.recv().unwrap();
            }

            std::hint::spin_loop();
        };

        match reply {
            ProcessReply::Done(tail_time) => tail_time,
            ProcessReply::NotReady => {
                // The params of this call never reached the processor, hand them
                // over again with the next one
                self.param_sizes.fill(0);
                true
            }
        }
    }
}

impl Drop for NapiAudioWorkletProcessor {
    fn drop(&mut self) {
        if !self.exited.load(Ordering::SeqCst) {
            self.send.send(WorkletCommand::Drop(self.id)).unwrap();
        }
    }
}
