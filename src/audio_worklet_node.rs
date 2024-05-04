use crate::utils::float_buffer_to_js;

use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use web_audio_api::worklet::*;

use web_audio_api::AudioParamDescriptor;

use crossbeam_channel::{self, Receiver, Sender};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, OnceLock};

/// Rust to JS processor inputs
pub(crate) struct ProcessorArguments {
    // raw ptr to the inputs (we can't Send a ref)
    inputs: *mut f32,
    // raw ptr to the outputs (we can't Send a ref)
    outputs: *mut f32,
    // raw ptrs to the params (we can't Send a ref)
    params: Vec<(String, *mut f32, usize)>,
    // tail_time return value
    tail_time: Arc<AtomicBool>,
}

unsafe impl Send for ProcessorArguments {}

// channel from main to worker
#[allow(clippy::type_complexity)] // will refactor later
pub(crate) fn send_recv_pair() -> &'static Mutex<(
    Option<Sender<ProcessorArguments>>,
    Option<Receiver<ProcessorArguments>>,
)> {
    static PAIR: OnceLock<
        Mutex<(
            Option<Sender<ProcessorArguments>>,
            Option<Receiver<ProcessorArguments>>,
        )>,
    > = OnceLock::new();
    PAIR.get_or_init(|| {
        let (send, recv) = crossbeam_channel::unbounded();
        Mutex::new((Some(send), Some(recv)))
    })
}

pub(crate) struct SendItem2(Vec<AudioParamDescriptor>);

// channel from worker to main
#[allow(clippy::type_complexity)] // will refactor later
pub(crate) fn send_recv_pair2() -> &'static (Sender<SendItem2>, Receiver<SendItem2>) {
    static PAIR: OnceLock<(Sender<SendItem2>, Receiver<SendItem2>)> = OnceLock::new();
    PAIR.get_or_init(crossbeam_channel::unbounded)
}

#[js_function(1)]
pub(crate) fn register_params(ctx: CallContext) -> Result<JsUndefined> {
    let js_params = ctx.get::<JsObject>(0)?;
    let length = js_params.get_array_length()? as usize;
    let mut rs_params: Vec<web_audio_api::AudioParamDescriptor> = Vec::with_capacity(length);

    for i in 0..length {
        let param = js_params.get_element::<JsObject>(i.try_into().unwrap())?;

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

    send_recv_pair2().0.send(SendItem2(rs_params)).unwrap();
    ctx.env.get_undefined()
}

#[js_function]
pub(crate) fn run_audio_worklet(ctx: CallContext) -> Result<JsUndefined> {
    println!("inside rust worklet");
    let recv = send_recv_pair().lock().unwrap().1.take().unwrap();

    for item in recv {
        let ProcessorArguments {
            inputs,
            outputs,
            params,
            tail_time,
        } = item;
        let proc = ctx
            .env
            .get_global()?
            .get_named_property::<JsObject>("proc123")?;
        let process = proc.get_named_property::<JsFunction>("process")?;

        let input_samples = float_buffer_to_js(ctx.env, inputs, 128);
        let mut input_channels = ctx.env.create_array(0)?;
        input_channels.insert(input_samples)?;
        let mut inputs = ctx.env.create_array(0)?;
        inputs.insert(input_channels)?;

        let output_samples = float_buffer_to_js(ctx.env, outputs, 128);
        let mut output_channels = ctx.env.create_array(0)?;
        output_channels.insert(output_samples)?;
        let mut outputs = ctx.env.create_array(0)?;
        outputs.insert(output_channels)?;

        let mut js_params = ctx.env.create_object()?;
        params.into_iter().for_each(|(name, ptr, len)| {
            let val = float_buffer_to_js(ctx.env, ptr, len);
            js_params.set_named_property(&name, val).unwrap()
        });

        let js_ret: JsUnknown = process.apply3(proc, inputs, outputs, js_params)?;
        let ret = js_ret.coerce_to_bool()?.get_value()?;
        tail_time.store(ret, Ordering::Relaxed);
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

#[js_function(3)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Create AudioBufferSourceOptions object
    // --------------------------------------------------------
    let options: AudioWorkletNodeOptions<()> = Default::default();
    let send = send_recv_pair().lock().unwrap().0.take().unwrap();

    // Remap the constructor options to include our processor options
    let AudioWorkletNodeOptions {
        number_of_inputs,
        number_of_outputs,
        output_channel_count,
        parameter_data,
        processor_options: _processor_options,
        audio_node_options,
    } = options;
    let tail_time = Arc::new(AtomicBool::new(false));
    let options = AudioWorkletNodeOptions {
        number_of_inputs,
        number_of_outputs,
        output_channel_count,
        parameter_data,
        audio_node_options,
        processor_options: (send, tail_time),
    };

    // --------------------------------------------------------
    // Create native AudioWorkletNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
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
    send: Sender<ProcessorArguments>,
    tail_time: Arc<AtomicBool>,
}

impl AudioWorkletProcessor for NapiAudioWorkletProcessor {
    type ProcessorOptions = (Sender<ProcessorArguments>, Arc<AtomicBool>);

    fn constructor(opts: Self::ProcessorOptions) -> Self {
        Self {
            send: opts.0,
            tail_time: opts.1,
        }
    }

    fn parameter_descriptors() -> Vec<AudioParamDescriptor>
    where
        Self: Sized,
    {
        dbg!(send_recv_pair2().1.recv().unwrap().0)
    }

    fn process<'a, 'b>(
        &mut self,
        inputs: &'b [&'a [&'a [f32]]],
        outputs: &'b mut [&'a mut [&'a mut [f32]]],
        params: AudioParamValues<'b>,
        _scope: &'b AudioWorkletGlobalScope,
    ) -> bool {
        let input_ptr = inputs[0][0].as_ptr() as *mut _;
        let output_ptr = outputs[0][0].as_mut_ptr();
        let param_ptr: Vec<_> = params
            .keys()
            .map(|k| {
                let value = params.get(k);
                (k.to_string(), value.as_ptr() as *mut _, value.len())
            })
            .collect();
        let item = ProcessorArguments {
            inputs: input_ptr,
            outputs: output_ptr,
            params: param_ptr,
            tail_time: Arc::clone(&self.tail_time),
        };
        self.send.send(item).unwrap();
        self.tail_time.load(Ordering::Relaxed)
    }
}
