#[macro_export]
macro_rules! connect_method {
    ($napi_struct:ident) => {
        #[js_function(3)]
        fn connect(ctx: napi::CallContext) -> napi::Result<napi::JsObject> {
            let this = ctx.this_unchecked::<napi::JsObject>();
            let napi_src = ctx.env.unwrap::<$napi_struct>(&this)?;
            let native_src = napi_src.unwrap();

            // get destination
            let js_dest = ctx.get::<napi::JsObject>(0)?;
            let dest_name = js_dest.get_named_property::<napi::JsString>("Symbol.toStringTag")?;

            let dest_uf8_name = dest_name.into_utf8()?.into_owned()?;
            let dest_str = &dest_uf8_name[..];

            let output_js: Option<JsNumber> = ctx.try_get::<JsNumber>(1)?.into();
            let output: u32 = if let Some(n) = output_js { n.try_into()? } else { 0 };

            let input_js: Option<JsNumber> = ctx.try_get::<JsNumber>(2)?.into();
            let input: u32 = if let Some(n) = input_js { n.try_into()? } else { 0 };

            match dest_str {
                "AudioParam" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_param::NapiAudioParam>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "AudioDestinationNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_destination_node::NapiAudioDestinationNode>(
                        &js_dest,
                    )?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                ${d.nodes.map(n => { return `"${d.name(n)}" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::${d.slug(n)}::${d.napiName(n)}>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                `}).join('')}
                _ => Err(napi::Error::from_reason(
                    "Cannot connect: Invalid destination node".to_string(),
                )),
            }
        }
    };
}
