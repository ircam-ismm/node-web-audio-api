#[macro_export]
macro_rules! connect_method {
    ($napi_struct:ident) => {
        #[js_function(3)]
        fn connect(ctx: napi::CallContext) -> napi::Result<napi::JsObject> {
            let js_this = ctx.this_unchecked::<napi::JsObject>();
            let napi_src = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let native_src = napi_src.unwrap();

            // get destination
            let js_dest = ctx.get::<napi::JsObject>(0)?;
            let dest_uf8_name = if let Ok(result) = js_dest.has_named_property("Symbol.toStringTag") {
                if result {
                    let dest_name = js_dest.get_named_property::<napi::JsString>("Symbol.toStringTag")?;
                    dest_name.into_utf8()?.into_owned()?
                } else {
                    let msg = "TypeError - Failed to execute 'connect' on 'AudioNode': Overload resolution failed";
                    return Err(napi::Error::new(napi::Status::InvalidArg, msg));
                }
            } else {
                let msg = "TypeError - Failed to execute 'connect' on 'AudioNode': Overload resolution failed";
                return Err(napi::Error::new(napi::Status::InvalidArg, msg));
            };

            let dest_str = &dest_uf8_name[..];

            // @todo - handle
            let output_js: Option<napi::JsNumber> = ctx.try_get::<napi::JsNumber>(1)?.into();
            let output: u32 = if let Some(n) = output_js { n.try_into()? } else { 0 };

            let input_js: Option<napi::JsNumber> = ctx.try_get::<napi::JsNumber>(2)?.into();
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
                _ => {
                    let msg = "TypeError - Failed to execute 'connect' on 'AudioNode': Overload resolution failed";
                    return Err(napi::Error::new(napi::Status::InvalidArg, msg));
                }
            }
        }
    };
}

#[macro_export]
macro_rules! disconnect_method {
    ($napi_struct:ident) => {
        #[js_function(1)]
        fn disconnect(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
            let js_this = ctx.this_unchecked::<napi::JsObject>();
            let napi_src = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let native_src = napi_src.unwrap();

            let js_dest_option: Option<napi::JsObject> = ctx.try_get::<napi::JsObject>(0)?.into();

            match js_dest_option {
                Some(js_dest) => {
                    let dest_uf8_name = if let Ok(result) = js_dest.has_named_property("Symbol.toStringTag") {
                        if result {
                            let dest_name = js_dest.get_named_property::<napi::JsString>("Symbol.toStringTag")?;
                            dest_name.into_utf8()?.into_owned()?
                        } else {
                            // if not a node, just disconnect from everything
                            native_src.disconnect();
                            return ctx.env.get_undefined();
                        }
                    } else {
                        // if not a node, just disconnect from everything
                        native_src.disconnect();
                        return ctx.env.get_undefined();
                    };

                    let dest_str = &dest_uf8_name[..];

                    match dest_str {
                        "AudioParam" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::audio_param::NapiAudioParam>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "AudioDestinationNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::audio_destination_node::NapiAudioDestinationNode>(
                                &js_dest,
                            )?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        ${d.nodes.map(n => { return `"${d.name(n)}" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::${d.slug(n)}::${d.napiName(n)}>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        `}).join('')}
                        _ => panic!("TypeError - Failed to execute 'disconnect' on 'AudioNode': Overload resolution failed"),
                    }
                }
                None => native_src.disconnect(),
            }

            ctx.env.get_undefined()
        }
    };
}
