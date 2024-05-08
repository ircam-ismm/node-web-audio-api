use crate::utils::{float_buffer_to_js, get_symbol_for};
use crate::{NapiAudioContext, NapiAudioParam, NapiOfflineAudioContext};

use crossbeam_channel::{self, Receiver, Sender};

use napi::*;
use napi_derive::js_function;

use web_audio_api::node::{AudioNode, AudioNodeOptions, ChannelCountMode, ChannelInterpretation};
use web_audio_api::worklet::{
    AudioParamValues, AudioWorkletGlobalScope, AudioWorkletNode, AudioWorkletNodeOptions,
    AudioWorkletProcessor,
};
use web_audio_api::AudioParamDescriptor;

use std::cell::Cell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{Mutex, OnceLock, RwLock};

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
    // AudioWorkletGlobalScope sampleRate
    sample_rate: f32,
    // channel for tail_time return value
    tail_time_sender: Sender<bool>,
}

/// Message channel from render thread to Worker
struct ProcessCallChannel {
    send: Sender<WorkletCommand>,
    recv: Receiver<WorkletCommand>,
}

/// Global map of ID -> ProcessCallChannel
///
/// Every (Offline)AudioContext is assigned a new channel + ID. The ID is passed to the
/// AudioWorklet Worker and to every AudioNode in the context so they can grab the channel and use
/// message passing.
static GLOBAL_PROCESS_CALL_CHANNEL_MAP: RwLock<Vec<ProcessCallChannel>> = RwLock::new(vec![]);

/// Request a new channel + ID for a newly created (Offline)AudioContext
pub(crate) fn allocate_process_call_channel() -> usize {
    let (send, recv) = crossbeam_channel::unbounded();
    let channel = ProcessCallChannel { send, recv };

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

/// Handle a AudioWorkletProcessor::process call in the Worker
fn process_audio_worklet(env: &Env, args: ProcessorArguments) -> Result<()> {
    let ProcessorArguments {
        id,
        inputs,
        outputs,
        param_values,
        current_time,
        current_frame,
        sample_rate,
        tail_time_sender,
    } = args;

    let mut global = env.get_global()?;

    // Make sure the processor exists, might run into race conditions
    // between Rust Audio thread and JS Worker thread
    let processor = global.get_named_property::<JsUnknown>(&id.to_string())?;
    if processor.get_type()? == ValueType::Undefined {
        return Ok(());
    }

    // fill AudioWorkletGlobalScope
    global.set_named_property("currentTime", current_time)?;
    global.set_named_property("currentFrame", current_frame)?;
    global.set_named_property("sampleRate", sample_rate)?;

    let processor = processor.coerce_to_object()?;

    let k_worklet_inputs = get_symbol_for(env, "node-web-audio-api:worklet-inputs");
    let k_worklet_outputs = get_symbol_for(env, "node-web-audio-api:worklet-outputs");

    let js_inputs = processor.get_property::<JsSymbol, JsObject>(k_worklet_inputs)?;

    for (input_number, input) in inputs.iter().enumerate() {
        let mut channels = js_inputs.get_element::<JsObject>(input_number as u32)?;

        for (channel_number, channel) in input.iter().enumerate() {
            let samples = float_buffer_to_js(env, channel.as_ptr() as *mut _, channel.len());
            // let _ = samples.freeze()?; // Error "Cannot freeze array buffer views with elements"
            channels.set_element(channel_number as u32, samples)?;
        }

        // delete remaining channels, if any
        for i in input.len() as u32..channels.get_array_length().unwrap() {
            channels.delete_element(i)?;
        }
    }

    let js_outputs = processor.get_property::<JsSymbol, JsObject>(k_worklet_outputs)?;

    for (output_number, output) in outputs.iter().enumerate() {
        let mut channels = js_outputs.get_element::<JsObject>(output_number as u32)?;

        for (channel_number, channel) in output.iter().enumerate() {
            let samples = float_buffer_to_js(env, channel.as_ptr() as *mut _, channel.len());
            channels.set_element(channel_number as u32, samples)?;
        }

        // delete remaining channels, if any
        for i in output.len() as u32..channels.get_array_length().unwrap() {
            channels.delete_element(i)?;
        }
    }

    let mut js_params = env.create_object()?;
    param_values.iter().for_each(|(name, data)| {
        let val = float_buffer_to_js(env, data.as_ptr() as *mut _, data.len());
        js_params.set_named_property(name, val).unwrap()
    });

    let process_method = processor.get_named_property::<JsFunction>("process")?;
    let js_ret: JsUnknown = process_method.apply3(processor, js_inputs, js_outputs, js_params)?;
    let ret = js_ret.coerce_to_bool()?.get_value()?;
    let _ = tail_time_sender.send(ret); // allowed to fail

    Ok(())
}

/// The entry point into Rust from the Worker
#[js_function(1)]
pub(crate) fn run_audio_worklet(ctx: CallContext) -> Result<JsUndefined> {
    // Set thread priority to highest, if not done already
    if !HAS_THREAD_PRIO.replace(true) {
        // allowed to fail
        let _ = thread_priority::set_current_thread_priority(thread_priority::ThreadPriority::Max);
    }

    // Obtain the unique worker ID
    let worklet_id = ctx.get::<JsNumber>(0)?.get_uint32()? as usize;

    // Wait for an incoming command
    match process_call_receiver(worklet_id).recv().unwrap() {
        WorkletCommand::Drop(id) => {
            let mut global = ctx.env.get_global()?;
            global.delete_named_property(&id.to_string()).unwrap();
        }
        WorkletCommand::Process(args) => {
            process_audio_worklet(ctx.env, args)?;
        }
    }

    ctx.env.get_undefined()
}

pub(crate) struct NapiAudioWorkletNode(AudioWorkletNode);

impl NapiAudioWorkletNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![];

        env.define_class("AudioWorkletNode", constructor, &interface)
    }

    pub fn unwrap(&self) -> &AudioWorkletNode {
        &self.0
    }
}

#[js_function(4)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // @note - not used, handled in the JS code
    // let js_name = ctx.get::<JsString>(1)?;

    // --------------------------------------------------------
    // Parse options
    // --------------------------------------------------------
    let options_js = ctx.get::<JsObject>(2)?;

    let number_of_inputs = options_js
        .get_named_property::<JsNumber>("numberOfInputs")?
        .get_double()? as usize;

    let number_of_outputs = options_js
        .get_named_property::<JsNumber>("numberOfOutputs")?
        .get_double()? as usize;

    let output_channel_count_js = options_js
        .get::<&str, JsTypedArray>("outputChannelCount")?
        .unwrap();
    let output_channel_count_value = output_channel_count_js.into_value()?;
    let output_channel_count_u32: &[u32] = output_channel_count_value.as_ref();
    let output_channel_count: Vec<usize> = output_channel_count_u32
        .iter()
        .map(|&v| v as usize)
        .collect();

    let mut parameter_data = HashMap::<String, f64>::new();
    let parameter_data_js = options_js.get_named_property::<JsObject>("parameterData")?;
    let parameter_keys_js = parameter_data_js.get_all_property_names(
        KeyCollectionMode::OwnOnly,
        KeyFilter::Enumerable,
        KeyConversion::NumbersToStrings,
    )?;
    let length = parameter_keys_js.get_array_length()?;

    for i in 0..length {
        let key_js = parameter_keys_js.get_element::<JsString>(i)?;
        let utf8_key = key_js.into_utf8()?;
        let key = utf8_key.into_owned()?;

        let value = parameter_data_js
            .get_property::<JsString, JsNumber>(key_js)?
            .get_double()?;

        parameter_data.insert(key, value);
    }

    // No `processorOptions` here, they are sent to JS processor

    // --------------------------------------------------------
    // Parse ParameterDescriptors
    // --------------------------------------------------------
    let params_js = ctx.get::<JsObject>(3)?;
    let length = params_js.get_array_length()? as usize;
    let mut rs_params: Vec<web_audio_api::AudioParamDescriptor> = Vec::with_capacity(length);

    for i in 0..length {
        let param = params_js.get_element::<JsObject>(i.try_into().unwrap())?;

        let js_name = param.get_named_property::<JsString>("name").unwrap();
        let utf8_name = js_name.into_utf8().unwrap();
        let name = utf8_name.into_owned().unwrap();

        let min_value = param
            .get_named_property::<JsNumber>("minValue")
            .unwrap()
            .get_double()
            .unwrap() as f32;

        let max_value = param
            .get_named_property::<JsNumber>("maxValue")
            .unwrap()
            .get_double()
            .unwrap() as f32;

        let default_value = param
            .get_named_property::<JsNumber>("defaultValue")
            .unwrap()
            .get_double()
            .unwrap() as f32;

        let param_descriptor = web_audio_api::AudioParamDescriptor {
            name,
            min_value,
            max_value,
            default_value,
            automation_rate: web_audio_api::AutomationRate::A,
        };

        rs_params.insert(i, param_descriptor);
    }

    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_str = audio_context_name.into_utf8()?;

    let worklet_id = match audio_context_str.as_str()? {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            napi_audio_context.worklet_id()
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            napi_audio_context.worklet_id()
        }
        &_ => panic!("not supported"),
    };

    // --------------------------------------------------------
    // Create AudioWorkletNodeOptions object
    // --------------------------------------------------------
    let id = INCREMENTING_ID.fetch_add(1, Ordering::Relaxed);
    let processor_options = NapiAudioWorkletProcessor {
        id,
        send: process_call_sender(worklet_id),
        tail_time_channel: crossbeam_channel::bounded(1),
        param_values: Vec::with_capacity(32),
    };

    let options = AudioWorkletNodeOptions {
        number_of_inputs,
        number_of_outputs,
        output_channel_count,
        parameter_data,
        audio_node_options: AudioNodeOptions::default(),
        processor_options,
    };

    // --------------------------------------------------------
    // send parameterDescriptors so that NapiAudioWorkletProcessor can retrieve them
    // --------------------------------------------------------
    let guard = audio_param_descriptor_channel().send.lock().unwrap();
    guard.send(rs_params).unwrap();

    // --------------------------------------------------------
    // Create native AudioWorkletNode
    // --------------------------------------------------------
    let native_node = match audio_context_str.as_str()? {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            AudioWorkletNode::new::<NapiAudioWorkletProcessor>(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            AudioWorkletNode::new::<NapiAudioWorkletProcessor>(audio_context, options)
        }
        &_ => panic!("not supported"),
    };

    drop(guard);

    let mut js_parameters = ctx.env.create_object()?;

    for (name, native_param) in native_node.parameters().iter() {
        let native_param = native_param.clone();
        let napi_param = NapiAudioParam::new(native_param);
        let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
        ctx.env.wrap(&mut js_obj, napi_param)?;

        js_parameters.set_named_property(name, js_obj)?;
    }

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        Property::new("parameters")?
            .with_value(&js_parameters)
            .with_property_attributes(PropertyAttributes::Enumerable),
        Property::new("id")?
            .with_value(&ctx.env.create_uint32(id)?)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("AudioWorkletNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiAudioWorkletNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiAudioWorkletNode);

// -------------------------------------------------
// AudioWorkletNode Interface
// -------------------------------------------------

struct NapiAudioWorkletProcessor {
    /// Unique id to pair Napi Worklet and JS processor
    id: u32,
    /// Sender to the JS Worklet
    send: Sender<WorkletCommand>,
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
            sample_rate: scope.sample_rate,
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
        self.send.send(WorkletCommand::Drop(self.id)).unwrap();
    }
}
