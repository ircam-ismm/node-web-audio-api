#[macro_export]
macro_rules! connect_method {
  ($napi_struct:ident) => {
    #[js_function(1)]
    fn connect(ctx: napi::CallContext) -> napi::Result<napi::JsObject> {
      let this = ctx.this_unchecked::<napi::JsObject>();
      let napi_src = ctx.env.unwrap::<$napi_struct>(&this)?;
      let native_src = napi_src.unwrap();

      // get destination
      let js_dest = ctx.get::<napi::JsObject>(0)?;
      let dest_name = js_dest.get_named_property::<napi::JsString>("Symbol.toStringTag")?;
      let dest_uf8_name = dest_name.into_utf8()?.into_owned()?;
      let dest_str = &dest_uf8_name[..];

      match dest_str {
        "AudioDestinationNode" => {
          let napi_dest = ctx
            .env
            .unwrap::<$crate::audio_destination_node::NapiAudioDestinationNode>(&js_dest)?;
          let native_dest = napi_dest.unwrap();
          native_src.connect(native_dest);

          Ok(js_dest)
        }
        "GainNode" => {
          let napi_dest = ctx
            .env
            .unwrap::<$crate::gain_node::NapiGainNode>(&js_dest)?;
          let native_dest = napi_dest.unwrap();
          native_src.connect(native_dest);

          Ok(js_dest)
        }
        "OscillatorNode" => {
          let napi_dest = ctx
            .env
            .unwrap::<$crate::oscillator_node::NapiOscillatorNode>(&js_dest)?;
          let native_dest = napi_dest.unwrap();
          native_src.connect(native_dest);

          Ok(js_dest)
        }
        "AudioParam" => {
          let napi_dest = ctx
            .env
            .unwrap::<$crate::audio_param::NapiAudioParam>(&js_dest)?;
          let native_dest = napi_dest.unwrap();
          native_src.connect(native_dest);

          Ok(js_dest)
        }
        _ => Err(napi::Error::from_reason(
          "Cannot connect: Invalid destination node".to_string(),
        )),
      }
    }
  };
}
