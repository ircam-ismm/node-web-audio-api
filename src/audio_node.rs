// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

#[macro_export]
macro_rules! audio_node_interface {
    [$($e:expr),*] => {
        [
            Property::new("numberOfInputs")?.with_getter(get_number_of_inputs),
            Property::new("numberOfOutputs")?.with_getter(get_number_of_outputs),
            Property::new("channelCount")?
                .with_getter(get_channel_count)
                .with_setter(set_channel_count),
            Property::new("channelCountMode")?
                .with_getter(get_channel_count_mode)
                .with_setter(set_channel_count_mode),
            Property::new("channelInterpretation")?
                .with_getter(get_channel_interpretation)
                .with_setter(set_channel_interpretation),
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

        #[js_function(3)]
        fn connect(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
            let js_this = ctx.this_unchecked::<napi::JsObject>();
            let napi_src = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let native_src = napi_src.unwrap();

            // get destination
            let js_dest = ctx.get::<napi::JsObject>(0)?;
            let dest_name = js_dest.get_named_property::<napi::JsString>("Symbol.toStringTag")?;
            let dest_uf8_name = dest_name.into_utf8()?.into_owned()?;
            let dest_str = &dest_uf8_name[..];

            let output = ctx.get::<napi::JsNumber>(1)?.get_double()? as usize;
            let input = ctx.get::<napi::JsNumber>(2)?.get_double()? as usize;

            match dest_str {
                "AudioParam" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_param::NapiAudioParam>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "AudioDestinationNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_destination_node::NapiAudioDestinationNode>(
                        &js_dest,
                    )?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "ScriptProcessorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::script_processor_node::NapiScriptProcessorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "AnalyserNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::analyser_node::NapiAnalyserNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "AudioBufferSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_buffer_source_node::NapiAudioBufferSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "BiquadFilterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::biquad_filter_node::NapiBiquadFilterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "ChannelMergerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::channel_merger_node::NapiChannelMergerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "ChannelSplitterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::channel_splitter_node::NapiChannelSplitterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "ConstantSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::constant_source_node::NapiConstantSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "ConvolverNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::convolver_node::NapiConvolverNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "DelayNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::delay_node::NapiDelayNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "DynamicsCompressorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::dynamics_compressor_node::NapiDynamicsCompressorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "GainNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::gain_node::NapiGainNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "IIRFilterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::iir_filter_node::NapiIIRFilterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "MediaStreamAudioSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "OscillatorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::oscillator_node::NapiOscillatorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "PannerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::panner_node::NapiPannerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "StereoPannerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::stereo_panner_node::NapiStereoPannerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }
                "WaveShaperNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::wave_shaper_node::NapiWaveShaperNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    native_src.connect_from_output_to_input(native_dest, output, input);
                    // proper return value is handled on JS side
                    ctx.env.get_undefined()
                }

                _ => {
                    let msg = "TypeError - Failed to execute 'connect' on 'AudioNode': Overload resolution failed";
                    return Err(napi::Error::new(napi::Status::InvalidArg, msg));
                }
            }
        }

        #[js_function(3)]
        fn disconnect(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
            let js_this = ctx.this_unchecked::<napi::JsObject>();
            let napi_src = ctx.env.unwrap::<$napi_struct>(&js_this)?;
            let native_src = napi_src.unwrap();

            if ctx.length == 0 {
                native_src.disconnect();
                return ctx.env.get_undefined();
            }

            // disconnect_output
            if ctx.length == 1 {
                let arg0 = ctx.get::<napi::JsUnknown>(0)?;

                match arg0.get_type()? {
                    ValueType::Number => {
                        let output = arg0.coerce_to_number()?.get_double()? as usize;
                        native_src.disconnect_output(output);

                        return ctx.env.get_undefined();
                    }
                    _ => {},
                }
            }

            // at this point, we are sure arg[0] is an AudioNode or an AudioParam
            let js_dest = ctx.get::<napi::JsObject>(0)?;
            let dest_name = js_dest.get_named_property::<napi::JsString>("Symbol.toStringTag")?;
            let dest_uf8_name = dest_name.into_utf8()?.into_owned()?;
            let dest_str = &dest_uf8_name[..];

            match dest_str {
                "AudioParam" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_param::NapiAudioParam>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "AudioDestinationNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_destination_node::NapiAudioDestinationNode>(
                        &js_dest,
                    )?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "ScriptProcessorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::script_processor_node::NapiScriptProcessorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "AnalyserNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::analyser_node::NapiAnalyserNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "AudioBufferSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_buffer_source_node::NapiAudioBufferSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "BiquadFilterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::biquad_filter_node::NapiBiquadFilterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "ChannelMergerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::channel_merger_node::NapiChannelMergerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "ChannelSplitterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::channel_splitter_node::NapiChannelSplitterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "ConstantSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::constant_source_node::NapiConstantSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "ConvolverNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::convolver_node::NapiConvolverNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "DelayNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::delay_node::NapiDelayNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "DynamicsCompressorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::dynamics_compressor_node::NapiDynamicsCompressorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "GainNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::gain_node::NapiGainNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "IIRFilterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::iir_filter_node::NapiIIRFilterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "MediaStreamAudioSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "OscillatorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::oscillator_node::NapiOscillatorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "PannerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::panner_node::NapiPannerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "StereoPannerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::stereo_panner_node::NapiStereoPannerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }
                "WaveShaperNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::wave_shaper_node::NapiWaveShaperNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();

                    if ctx.length == 3 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        let input = ctx.get::<JsNumber>(2)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output_to_input(
                            native_dest,
                            output,
                            input
                        );
                    } else if ctx.length == 2 {
                        let output = ctx.get::<JsNumber>(1)?.get_double()? as usize;
                        native_src.disconnect_dest_from_output(native_dest, output);
                    } else {
                        native_src.disconnect_dest(native_dest);
                    }
                }

                _ => unreachable!(),
            }

            ctx.env.get_undefined()
        }
    };
}
