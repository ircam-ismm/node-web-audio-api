#![deny(clippy::all)]

use napi::{Env, JsObject, Result};
use napi_derive::module_exports;

#[macro_use]
mod audio_node;

mod audio_context;
use crate::audio_context::NapiAudioContext;
mod audio_destination_node;
// use crate::audio_destination_node::NapiAudioDestinationNode;
mod audio_param;
// use crate::audio_param::NapiAudioParam;
mod gain_node;
use crate::gain_node::NapiGainNode;
mod oscillator_node;
use crate::oscillator_node::NapiOscillatorNode;

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
  let audio_context_class = NapiAudioContext::create_js_class(&env)?;
  exports.set_named_property("AudioContext", audio_context_class)?;

  let gain_node_class = NapiGainNode::create_js_class(&env)?;
  exports.set_named_property("GainNode", gain_node_class)?;

  let oscillator_node_class = NapiOscillatorNode::create_js_class(&env)?;
  exports.set_named_property("OscillatorNode", oscillator_node_class)?;

  Ok(())
}
