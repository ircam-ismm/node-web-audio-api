#[macro_export]
macro_rules! audio_node_interface {
    [$($e:expr),*] => {
        [
            Property::new("channelCount")?
                .with_getter(get_channel_count)
                .with_setter(set_channel_count),
            Property::new("channelCountMode")?
                .with_getter(get_channel_count_mode)
                .with_setter(set_channel_count_mode),
            Property::new("channelInterpretation")?
                .with_getter(get_channel_interpretation)
                .with_setter(set_channel_interpretation),
            Property::new("numberOfInputs")?.with_getter(get_number_of_inputs),
            Property::new("numberOfOutputs")?.with_getter(get_number_of_outputs),
            Property::new("connect")?.with_method(connect),
            Property::new("disconnect")?.with_method(disconnect),
            $($e,)*
        ]
    }
}

#[macro_export]
macro_rules! audio_node_impl {
    ($napi_struct:ident) => {
        #[js_function]
        fn get_channel_count(ctx: CallContext) -> Result<JsNumber> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let channel_count = node.channel_count() as f64;

            ctx.env.create_double(channel_count)
        }

        #[js_function(1)]
        fn set_channel_count(ctx: CallContext) -> Result<JsUndefined> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let channel_count = ctx.get::<JsNumber>(0)?.get_double()? as usize;
            node.set_channel_count(channel_count);

            ctx.env.get_undefined()
        }

        #[js_function]
        fn get_channel_count_mode(ctx: CallContext) -> Result<JsString> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let value = node.channel_count_mode();
            let value_str = match value {
                ChannelCountMode::Max => "max",
                ChannelCountMode::ClampedMax => "clamped-max",
                ChannelCountMode::Explicit => "explicit",
            };

            ctx.env.create_string(value_str)
        }

        #[js_function(1)]
        fn set_channel_count_mode(ctx: CallContext) -> Result<JsUndefined> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let js_str = ctx.get::<JsString>(0)?;
            let uf8_str = js_str.into_utf8()?.into_owned()?;
            let value = match uf8_str.as_str() {
                "max" => ChannelCountMode::Max,
                "clamped-max" => ChannelCountMode::ClampedMax,
                "explicit" => ChannelCountMode::Explicit,
                _ => unreachable!(),
            };
            node.set_channel_count_mode(value);

            ctx.env.get_undefined()
        }

        #[js_function]
        fn get_channel_interpretation(ctx: CallContext) -> Result<JsString> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let value = node.channel_interpretation();
            let value_str = match value {
                ChannelInterpretation::Speakers => "speakers",
                ChannelInterpretation::Discrete => "discrete",
            };

            ctx.env.create_string(value_str)
        }

        #[js_function(1)]
        fn set_channel_interpretation(ctx: CallContext) -> Result<JsUndefined> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let js_str = ctx.get::<JsString>(0)?;
            let uf8_str = js_str.into_utf8()?.into_owned()?;
            let value = match uf8_str.as_str() {
                "speakers" => ChannelInterpretation::Speakers,
                "discrete" => ChannelInterpretation::Discrete,
                _ => unreachable!(),
            };
            node.set_channel_interpretation(value);

            ctx.env.get_undefined()
        }

        #[js_function]
        fn get_number_of_inputs(ctx: CallContext) -> Result<JsNumber> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let number_of_inputs = node.number_of_inputs() as f64;

            ctx.env.create_double(number_of_inputs)
        }

        #[js_function]
        fn get_number_of_outputs(ctx: CallContext) -> Result<JsNumber> {
            let js_this = ctx.this_unchecked::<JsObject>();
            let napi_node = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let node = napi_node.unwrap();

            let number_of_outputs = node.number_of_outputs() as f64;

            ctx.env.create_double(number_of_outputs)
        }

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
