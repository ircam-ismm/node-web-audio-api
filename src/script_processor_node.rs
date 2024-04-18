use crate::*;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;

pub(crate) struct NapiScriptProcessorNode(ScriptProcessorNode);

impl NapiScriptProcessorNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        let interface = audio_node_interface![
            Property::new("bufferSize")?.with_getter(get_buffer_size),
            Property::new("__initEventTarget__")?.with_method(init_event_target)
        ];

        env.define_class("ScriptProcessorNode", constructor, &interface)
    }

    pub fn unwrap(&self) -> &ScriptProcessorNode {
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
    // Create native ScriptProcessorNode
    // --------------------------------------------------------
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let native_node = match audio_context_str {
        "AudioContext" => {
            let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ScriptProcessorNode::new(audio_context, options)
        }
        "OfflineAudioContext" => {
            let napi_audio_context = ctx
                .env
                .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            let audio_context = napi_audio_context.unwrap();
            ScriptProcessorNode::new(audio_context, options)
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
            .with_value(&ctx.env.create_string("ScriptProcessorNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    // finalize instance creation
    let napi_node = NapiScriptProcessorNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

audio_node_impl!(NapiScriptProcessorNode);

// -------------------------------------------------
// ScriptProcessorNode Interface
// -------------------------------------------------

#[js_function]
fn get_buffer_size(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiScriptProcessorNode>(&js_this)?;
    let node = napi_node.unwrap();

    let buffer_size = node.buffer_size() as f64;

    ctx.env.create_double(buffer_size)
}

// ----------------------------------------------------
// EventTarget initialization - cf. js/utils/events.js
// ----------------------------------------------------
#[js_function]
fn init_event_target(ctx: CallContext) -> Result<JsUndefined> {
    // use crate::utils::WebAudioEventType;
    use crate::utils::{ThreadSafeCallContext, ThreadsafeFunction, ThreadsafeFunctionCallMode};
    use web_audio_api::{AudioBuffer, AudioProcessingEvent};

    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiScriptProcessorNode>(&js_this)?;
    let node = napi_node.unwrap();

    // garb the napi audio context
    let js_audio_context: JsObject = js_this.get_named_property("context")?;
    let audio_context_name =
        js_audio_context.get_named_property::<JsString>("Symbol.toStringTag")?;
    let audio_context_utf8_name = audio_context_name.into_utf8()?.into_owned()?;
    let audio_context_str = &audio_context_utf8_name[..];

    let dispatch_event_symbol = ctx
        .env
        .symbol_for("node-web-audio-api:napi-dispatch-event")
        .unwrap();
    let js_func: JsFunction = js_this.get_property(dispatch_event_symbol).unwrap();

    let tsfn = ThreadsafeFunction::create(
        ctx.env.raw(),
        unsafe { js_func.raw() },
        0,
        move |ctx: ThreadSafeCallContext<AudioProcessingEvent>| {
            // let native_event = ctx.value.unwrap_audio_processing_event();
            let mut event = ctx.value;
            let event_type = ctx.env.create_string("audioprocess")?;
            let playback_time = ctx.env.create_double(event.playback_time)?;

            // // input buffer
            let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
            let store: JsObject = ctx.env.get_reference_value(store_ref)?;
            let ctor: JsFunction = store.get_named_property("AudioBuffer")?;

            // populate with audio buffer
            let mut options = ctx.env.create_object()?;
            options.set("__internal_caller__", ctx.env.get_null())?;

            let js_input_buffer = ctor.new_instance(&[options])?;
            let napi_input_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_input_buffer)?;
            // grab input buffer from event to give it Napi AudioBuffer
            let input_tumbstone = AudioBuffer::from(vec![vec![]], 48_000.);
            let input_buffer = std::mem::replace(&mut event.input_buffer, input_tumbstone);
            napi_input_buffer.populate(input_buffer);

            // ...
            let mut options = ctx.env.create_object()?;
            options.set("__internal_caller__", ctx.env.get_null())?;

            let js_output_buffer = ctor.new_instance(&[options])?;
            let napi_output_buffer = ctx.env.unwrap::<NapiAudioBuffer>(&js_output_buffer)?;
            // grab output buffer from event to give it Napi AudioBuffer
            let output_tumbstone = AudioBuffer::from(vec![vec![]], 48_000.);
            let output_buffer = std::mem::replace(&mut event.output_buffer, output_tumbstone);
            napi_output_buffer.populate(output_buffer);

            // create js event
            let mut js_event = ctx.env.create_object()?;
            js_event.set_named_property("type", event_type)?;
            js_event.set_named_property("playbackTime", playback_time)?;
            js_event.set_named_property("inputBuffer", js_input_buffer)?;
            js_event.set_named_property("outputBuffer", js_output_buffer)?;

            // execute javascript callback
            ctx.callback.call(
                None,
                &[
                    // follow node.js convention: 1rst argument is error
                    ctx.env.get_undefined()?.into_unknown(),
                    js_event.into_unknown(),
                ],
            )?;

            let mut output_buffer = napi_output_buffer.take();
            std::mem::swap(&mut event.output_buffer, &mut output_buffer);

            Ok(())
        },
    )?;

    // @note - we have no hint to clear the listener from the tsfn store
    // cf. napi_unref_threadsafe_function (?)
    match audio_context_str {
        "AudioContext" => {
            // let napi_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
            // let store_id = napi_context.tsfn_store().add(tsfn.clone());
            // let napi_context = napi_context.clone();

            node.set_onaudioprocess(move |e| {
                tsfn.call(e, ThreadsafeFunctionCallMode::Blocking);
            });
        }
        "OfflineAudioContext" => {
            // let napi_context = ctx
            //     .env
            //     .unwrap::<NapiOfflineAudioContext>(&js_audio_context)?;
            // let store_id = napi_context.tsfn_store().add(tsfn.clone());
            // let napi_context = napi_context.clone();

            node.set_onaudioprocess(move |e| {
                // let event = WebAudioEventType::from(e);
                tsfn.call(e, ThreadsafeFunctionCallMode::Blocking);
            });
        }
        &_ => unreachable!(),
    };

    ctx.env.get_undefined()
}
