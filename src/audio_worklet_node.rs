use crate::utils::float_buffer_to_js;

use crate::*;
use napi::*;
use napi_derive::{js_function, napi};
use web_audio_api::node::*;
use web_audio_api::worklet::*;

use web_audio_api::AudioParamDescriptor;

use crossbeam_channel::{self, Receiver, Sender};
use std::sync::{Mutex, OnceLock};

// channel from main to worker
pub(crate) struct SendItem(*mut f32, *mut f32, Vec<(String, *mut f32, usize)>);
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

        let input_samples = float_buffer_to_js(&env, item.0, 128);
        let mut input_channels = env.create_array(0)?;
        input_channels.insert(input_samples)?;
        let mut inputs = env.create_array(0)?;
        inputs.insert(input_channels)?;

        let output_samples = float_buffer_to_js(&env, item.1, 128);
        let mut output_channels = env.create_array(0)?;
        output_channels.insert(output_samples)?;
        let mut outputs = env.create_array(0)?;
        outputs.insert(output_channels)?;

        let mut params = env.create_object()?;
        item.2.into_iter().for_each(|(name, ptr, len)| {
            let val = float_buffer_to_js(&env, ptr, len);
            params.set_named_property(&name, val).unwrap()
        });

        let js_ret: JsUnknown = process.apply3(proc, inputs, outputs, params)?;
        let _ret = js_ret.coerce_to_bool()?.get_value()?;
    }
    env.get_undefined()
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
    let options = AudioWorkletNodeOptions {
        number_of_inputs,
        number_of_outputs,
        output_channel_count,
        parameter_data,
        audio_node_options,
        processor_options: send,
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

    /* TODO expose parameters in JS
    dbg!(native_node.parameters());
    let param_bit_depth = native_node.parameters().get("bitDepth").unwrap();
    let param_reduction = native_node.parameters().get("frequencyReduction").unwrap();
    param_bit_depth.set_value_at_time(1., 0.);
    param_reduction.set_value_at_time(0.01, 0.);
    param_reduction.linear_ramp_to_value_at_time(0.1, 4.);
    param_reduction.exponential_ramp_to_value_at_time(0.01, 8.);
    */

    // --------------------------------------------------------
    // Finalize instance creation
    // --------------------------------------------------------
    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
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
    send: Sender<SendItem>,
}

impl AudioWorkletProcessor for NapiAudioWorkletProcessor {
    type ProcessorOptions = Sender<SendItem>;

    fn constructor(opts: Self::ProcessorOptions) -> Self {
        Self { send: opts }
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
        let item = SendItem(input_ptr, output_ptr, param_ptr);
        self.send.send(item).unwrap();
        true
        // convert to JS frozen arrays (requires env..)
        // - inputs
        // - outputs
        // convert to maplike
        // - params

        // send to worker thread
        // await result
        // drop js stuff
        // pass return value
        //todo!()
    }
}
