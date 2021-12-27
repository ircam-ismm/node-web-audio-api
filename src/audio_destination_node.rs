use napi::{Env, JsObject, Result};

use web_audio_api::node::DestinationNode;

pub struct NapiAudioDestinationNode(DestinationNode);

impl NapiAudioDestinationNode {
  pub fn new(destination: DestinationNode) -> Self {
    Self(destination)
  }

  pub fn create_js_object(env: &Env) -> Result<JsObject> {
    let mut obj = env.create_object()?;

    obj.set_named_property(
      "Symbol.toStringTag",
      env.create_string("AudioDestinationNode")?,
    )?;

    Ok(obj)
  }

  pub fn unwrap(&self) -> &DestinationNode {
    &self.0
  }
}
