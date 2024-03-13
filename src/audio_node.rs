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
                "AnalyserNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::analyser_node::NapiAnalyserNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "AudioBufferSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::audio_buffer_source_node::NapiAudioBufferSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "BiquadFilterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::biquad_filter_node::NapiBiquadFilterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "ChannelMergerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::channel_merger_node::NapiChannelMergerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "ChannelSplitterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::channel_splitter_node::NapiChannelSplitterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "ConstantSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::constant_source_node::NapiConstantSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "ConvolverNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::convolver_node::NapiConvolverNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "DelayNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::delay_node::NapiDelayNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "DynamicsCompressorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::dynamics_compressor_node::NapiDynamicsCompressorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "GainNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::gain_node::NapiGainNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "IIRFilterNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::iir_filter_node::NapiIIRFilterNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "MediaStreamAudioSourceNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "OscillatorNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::oscillator_node::NapiOscillatorNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "PannerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::panner_node::NapiPannerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "StereoPannerNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::stereo_panner_node::NapiStereoPannerNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }
                "WaveShaperNode" => {
                    let napi_dest = ctx
                        .env
                        .unwrap::<$crate::wave_shaper_node::NapiWaveShaperNode>(&js_dest)?;
                    let native_dest = napi_dest.unwrap();
                    let _res = native_src.connect_at(native_dest, output as usize, input as usize);

                    Ok(js_dest)
                }

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
                        "AnalyserNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::analyser_node::NapiAnalyserNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "AudioBufferSourceNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::audio_buffer_source_node::NapiAudioBufferSourceNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "BiquadFilterNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::biquad_filter_node::NapiBiquadFilterNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "ChannelMergerNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::channel_merger_node::NapiChannelMergerNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "ChannelSplitterNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::channel_splitter_node::NapiChannelSplitterNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "ConstantSourceNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::constant_source_node::NapiConstantSourceNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "ConvolverNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::convolver_node::NapiConvolverNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "DelayNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::delay_node::NapiDelayNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "DynamicsCompressorNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::dynamics_compressor_node::NapiDynamicsCompressorNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "GainNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::gain_node::NapiGainNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "IIRFilterNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::iir_filter_node::NapiIIRFilterNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "MediaStreamAudioSourceNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "OscillatorNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::oscillator_node::NapiOscillatorNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "PannerNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::panner_node::NapiPannerNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "StereoPannerNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::stereo_panner_node::NapiStereoPannerNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }
                        "WaveShaperNode" => {
                            let napi_dest = ctx
                                .env
                                .unwrap::<$crate::wave_shaper_node::NapiWaveShaperNode>(&js_dest)?;
                            let native_dest = napi_dest.unwrap();
                            native_src.disconnect_from(native_dest);
                        }

                        _ => panic!("TypeError - Failed to execute 'disconnect' on 'AudioNode': Overload resolution failed"),
                    }
                }
                None => native_src.disconnect(),
            }

            ctx.env.get_undefined()
        }
    };
}
