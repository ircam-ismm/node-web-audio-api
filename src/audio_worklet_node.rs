use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use web_audio_api::{AudioBuffer, AudioProcessingEvent};

use crate::utils::{
    ThreadSafeCallContext as ThreadSafeCallContextPatched,
    ThreadsafeFunction as ThreadsafeFunctionPatched,
    ThreadsafeFunctionCallMode as ThreadsafeFunctionCallModePatched,
};
use crate::*;

pub(crate) struct NapiAudioWorkletNode(AudioWorkletNode);

impl NapiAudioWorkletNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("bufferSize")?.with_getter(get_buffer_size),
            Property::new("listen_to_events")?.with_method(listen_to_events)
        ];

        env.define_class("AudioWorkletNode", constructor, &interface)
    }

    pub fn unwrap(&self) -> &AudioWorkletNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;

    // --------------------------------------------------------
    // Parse ScriptProcessorOptions
    // by bindings construction all fields are populated on the JS side
    // --------------------------------------------------------
    let js_options = ctx.get::<JsObject>(1)?;

    let buffer_size = js_options
        .get::<&str, JsNumber>("bufferSize")?
        .unwrap()
        .get_double()? as usize;

    let number_of_input_channels = js_options
        .get::<&str, JsNumber>("numberOfInputChannels")?
        .unwrap()
        .get_double()? as usize;

    let number_of_output_channels = js_options
        .get::<&str, JsNumber>("numberOfOutputChannels")?
        .unwrap()
        .get_double()? as usize;

    // --------------------------------------------------------
    // Create AudioBufferSourceOptions object
    // --------------------------------------------------------
    let options = ScriptProcessorOptions {
        buffer_size,
        number_of_input_channels,
        number_of_output_channels,
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
            AudioWorkletNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            AudioWorkletNode::new(audio_context, options)
        }
        &_ => panic!("not supported"),
    };

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

#[js_function]
fn get_buffer_size(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioWorkletNode>(&js_this)?;
    let node = napi_node.unwrap();

    let buffer_size = node.buffer_size() as f64;

    ctx.env.create_double(buffer_size)
}

#[js_function]
fn listen_to_events(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiAudioWorkletNode>(&js_this)?;
    let node = napi_node.unwrap();

    let k_onaudioprocess =
        crate::utils::get_symbol_for(ctx.env, "node-web-audio-api:onaudioprocess");
    let audioprocess_cb: JsFunction = js_this.get_property(k_onaudioprocess).unwrap();

    let audioprocess_tsfn = ThreadsafeFunctionPatched::create(
        ctx.env.raw(),
        unsafe { audioprocess_cb.raw() },
        0,
        move |ctx: ThreadSafeCallContextPatched<AudioProcessingEvent>| {
            let mut event = ctx.value;

            // create input and output buffers
            let ctor = crate::utils::get_class_ctor(&ctx.env, "AudioBuffer")?;

            let js_input_buffer = ctor.new_instance(&[ctx.env.get_null()?])?;
            let napi_input_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_input_buffer)?;

            let js_output_buffer = ctor.new_instance(&[ctx.env.get_null()?])?;
            let napi_output_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_output_buffer)?;

            // grab input and output buffer sfrom event to give it Napi AudioBuffer
            let input_tumbstone = AudioBuffer::from(vec![vec![]], 48_000.);
            let input_buffer = std::mem::replace(&mut event.input_buffer, input_tumbstone);
            napi_input_buffer.insert(input_buffer);

            let output_tumbstone = AudioBuffer::from(vec![vec![]], 48_000.);
            let output_buffer = std::mem::replace(&mut event.output_buffer, output_tumbstone);
            napi_output_buffer.insert(output_buffer);

            // create js event
            let mut js_event = ctx.env.create_object()?;
            js_event.set_named_property("type", ctx.env.create_string("audioprocess")?)?;
            js_event
                .set_named_property("playbackTime", ctx.env.create_double(event.playback_time)?)?;
            js_event.set_named_property("inputBuffer", js_input_buffer)?;
            js_event.set_named_property("outputBuffer", js_output_buffer)?;

            // execute javascript callback
            ctx.callback
                .expect("Invalid JS callback for audioprocess event")
                .call(
                    None,
                    &[
                        // follow node.js convention: 1rst argument is error
                        ctx.env.get_undefined()?.into_unknown(),
                        js_event.into_unknown(),
                    ],
                )?;

            // put back the output buffer into the rust event
            let mut output_buffer = napi_output_buffer.take();
            std::mem::swap(&mut event.output_buffer, &mut output_buffer);

            Ok(())
        },
    )?;

    // not implemented in threadsafe patched version
    // let _ = audioprocess_tsfn.unref(ctx.env);

    node.set_onaudioprocess(move |e| {
        audioprocess_tsfn.call(e, ThreadsafeFunctionCallModePatched::Blocking);
    });

    ctx.env.get_undefined()
}
