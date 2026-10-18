//! AudioWorkletProcessors written in Rust
//!
//! A crate that builds its own Node library around this one (as an rlib)
//! registers its processors at load with [`register_native_processor`]. An
//! `AudioWorkletNode` created with a registered name then runs the Rust
//! processor on the render thread itself, with no Worker and no hand-off per
//! render quantum. Its port carries serde values both ways: decoded on the
//! control thread and encoded on the JS thread, never on the render thread.
//!
//! Typed arrays cross as bytes. One posted to the processor reaches its
//! deserializer as the bytes of a `Uint8Array` view, and an object
//! `{ Float32Array: <bytes> }` the processor posts arrives as a `Float32Array`
//! of those bytes.

use std::any::Any;
use std::sync::RwLock;

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::de::DeserializeOwned;
use serde::Serialize;
use web_audio_api::context::{AudioContext, OfflineAudioContext};
use web_audio_api::worklet::{AudioWorkletNode, AudioWorkletNodeOptions, AudioWorkletProcessor};

#[derive(Clone, Copy)]
pub(crate) struct NativeProcessor {
    pub(crate) create_online: fn(&AudioContext, AudioWorkletNodeOptions<()>) -> AudioWorkletNode,
    pub(crate) create_offline:
        fn(&OfflineAudioContext, AudioWorkletNodeOptions<()>) -> AudioWorkletNode,
    /// Decodes a message posted in JS and sends it to the processor, on the control thread
    pub(crate) post_message: fn(&Env, Unknown, &AudioWorkletNode) -> Result<()>,
    /// Encodes a message of the processor for JS, on the JS thread
    pub(crate) encode_message: fn(&Env, Box<dyn Any + Send>) -> Result<Unknown<'static>>,
}

static NATIVE_PROCESSORS: RwLock<Vec<(String, NativeProcessor)>> = RwLock::new(Vec::new());

/// Run `P` for every `AudioWorkletNode` created with `name`, in place of a JS processor
///
/// `M` is what the node's port posts to the processor, which receives it in
/// `onmessage`. `E` is what the processor posts back with
/// `AudioWorkletGlobalScope::post_message(Box::new(event))`.
///
/// # Panics
///
/// Panics if the registry lock is poisoned.
pub fn register_native_processor<P, M, E>(name: &str)
where
    P: AudioWorkletProcessor<ProcessorOptions = ()> + 'static,
    M: DeserializeOwned + Send + 'static,
    E: Serialize + Send + 'static,
{
    let processor = NativeProcessor {
        create_online: |context, options| AudioWorkletNode::new::<P>(context, options),
        create_offline: |context, options| AudioWorkletNode::new::<P>(context, options),
        post_message: |env, value, node| {
            let message: M = env.from_js_value(value)?;
            node.port().post_message(message);
            Ok(())
        },
        encode_message: encode_message::<E>,
    };

    let mut processors = NATIVE_PROCESSORS.write().unwrap();
    processors.retain(|(registered, _)| registered != name);
    processors.push((name.to_string(), processor));
}

fn encode_message<E: Serialize + 'static>(
    env: &Env,
    message: Box<dyn Any + Send>,
) -> Result<Unknown<'static>> {
    let message = message
        .downcast::<E>()
        .map_err(|_| Error::from_reason("A native processor posted a message of another type"))?;
    env.to_js_value(&*message)
}

pub(crate) fn native_processor(name: &str) -> Option<NativeProcessor> {
    NATIVE_PROCESSORS
        .read()
        .unwrap()
        .iter()
        .find(|(registered, _)| registered == name)
        .map(|(_, processor)| *processor)
}

#[napi(js_name = "hasNativeProcessor")]
pub fn has_native_processor(name: String) -> bool {
    native_processor(&name).is_some()
}
