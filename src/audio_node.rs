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
macro_rules! audio_node_impl {
    ($napi_struct:ident) => {
        #[napi]
        impl $napi_struct {
            #[napi(getter, js_name = "numberOfInputs")]
            pub fn get_number_of_inputs(&self) -> u32 {
                self.inner.number_of_inputs() as u32
            }

            #[napi(getter, js_name = "numberOfOutputs")]
            pub fn set_number_of_outputs(&self) -> u32 {
                self.inner.number_of_outputs() as u32
            }

            #[napi(getter, js_name = "channelCount")]
            pub fn get_channel_count(&self) -> u32 {
                self.inner.channel_count() as u32
            }

            #[napi(setter, catch_unwind, js_name = "channelCount")]
            pub fn set_channel_count(&self, channel_count: u32) {
                self.inner.set_channel_count(channel_count as usize);
            }

            #[napi(getter, js_name = "channelCountMode")]
            pub fn get_channel_count_mode(&self) -> String {
                let channel_count_mode = self.inner.channel_count_mode();
                let channel_count_mode = match channel_count_mode {
                    ChannelCountMode::Max => "max",
                    ChannelCountMode::ClampedMax => "clamped-max",
                    ChannelCountMode::Explicit => "explicit",
                };
                channel_count_mode.into()
            }

            #[napi(setter, catch_unwind, js_name = "channelCountMode")]
            pub fn set_channel_count_mode(&self, channel_count_mode: String) {
                let channel_count_mode = match channel_count_mode.as_str() {
                    "max" => ChannelCountMode::Max,
                    "clamped-max" => ChannelCountMode::ClampedMax,
                    "explicit" => ChannelCountMode::Explicit,
                    _ => unreachable!(),
                };
                self.inner.set_channel_count_mode(channel_count_mode);
            }

            #[napi(getter, js_name = "channelInterpretation")]
            pub fn get_channel_interpretation(&self) -> String {
                let channel_interpretation = self.inner.channel_interpretation();
                let channel_interpretation = match channel_interpretation {
                    ChannelInterpretation::Speakers => "speakers",
                    ChannelInterpretation::Discrete => "discrete",
                };
                channel_interpretation.into()
            }

            #[napi(setter, catch_unwind, js_name = "channelInterpretation")]
            pub fn set_channel_interpretation(&self, channel_interpretation: String) {
                let channel_interpretation = match channel_interpretation.as_str() {
                    "speakers" => ChannelInterpretation::Speakers,
                    "discrete" => ChannelInterpretation::Discrete,
                    _ => unreachable!(),
                };
                self.inner
                    .set_channel_interpretation(channel_interpretation);
            }

            #[napi(catch_unwind)]
            pub fn connect(
                &mut self,
                dest: Either20<
                    &$crate::audio_param::NapiAudioParam,
                    &$crate::audio_destination_node::NapiAudioDestinationNode,
                    &$crate::script_processor_node::NapiScriptProcessorNode,
                    &$crate::audio_worklet_node::NapiAudioWorkletNode,
                    &$crate::analyser_node::NapiAnalyserNode,
                    &$crate::audio_buffer_source_node::NapiAudioBufferSourceNode,
                    &$crate::biquad_filter_node::NapiBiquadFilterNode,
                    &$crate::channel_merger_node::NapiChannelMergerNode,
                    &$crate::channel_splitter_node::NapiChannelSplitterNode,
                    &$crate::constant_source_node::NapiConstantSourceNode,
                    &$crate::convolver_node::NapiConvolverNode,
                    &$crate::delay_node::NapiDelayNode,
                    &$crate::dynamics_compressor_node::NapiDynamicsCompressorNode,
                    &$crate::gain_node::NapiGainNode,
                    &$crate::iir_filter_node::NapiIIRFilterNode,
                    &$crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode,
                    &$crate::oscillator_node::NapiOscillatorNode,
                    &$crate::panner_node::NapiPannerNode,
                    &$crate::stereo_panner_node::NapiStereoPannerNode,
                    &$crate::wave_shaper_node::NapiWaveShaperNode,
                >,
                output: Option<u32>,
                input: Option<u32>,
            ) {
                let output: usize = output.unwrap_or(0).try_into().unwrap();
                let input: usize = input.unwrap_or(0).try_into().unwrap();

                match dest {
                    Either20::A(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::B(dest) => {
                        self.inner
                            .connect_from_output_to_input(dest.inner.as_ref(), output, input);
                    }

                    Either20::C(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::D(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::E(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::F(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::G(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::H(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::I(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::J(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::K(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::L(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::M(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::N(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::O(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::P(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::Q(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::R(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::S(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either20::T(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                }
            }

            #[napi(catch_unwind)]
            pub fn disconnect(
                &mut self,
                output_or_dest: Option<
                    Either21<
                        u32,
                        &$crate::audio_param::NapiAudioParam,
                        &$crate::audio_destination_node::NapiAudioDestinationNode,
                        &$crate::script_processor_node::NapiScriptProcessorNode,
                        &$crate::audio_worklet_node::NapiAudioWorkletNode,
                        &$crate::analyser_node::NapiAnalyserNode,
                        &$crate::audio_buffer_source_node::NapiAudioBufferSourceNode,
                        &$crate::biquad_filter_node::NapiBiquadFilterNode,
                        &$crate::channel_merger_node::NapiChannelMergerNode,
                        &$crate::channel_splitter_node::NapiChannelSplitterNode,
                        &$crate::constant_source_node::NapiConstantSourceNode,
                        &$crate::convolver_node::NapiConvolverNode,
                        &$crate::delay_node::NapiDelayNode,
                        &$crate::dynamics_compressor_node::NapiDynamicsCompressorNode,
                        &$crate::gain_node::NapiGainNode,
                        &$crate::iir_filter_node::NapiIIRFilterNode,
                        &$crate::media_stream_audio_source_node::NapiMediaStreamAudioSourceNode,
                        &$crate::oscillator_node::NapiOscillatorNode,
                        &$crate::panner_node::NapiPannerNode,
                        &$crate::stereo_panner_node::NapiStereoPannerNode,
                        &$crate::wave_shaper_node::NapiWaveShaperNode,
                    >,
                >,
                output: Option<u32>,
                input: Option<u32>,
            ) {
                if output_or_dest.is_none() && (output.is_some() || input.is_some()) {
                    panic!("Invalid disconnect call");
                }

                // undefined disconnect ();
                if let (None, None, None) = (output_or_dest, output, input) {
                    self.inner.disconnect();
                    return;
                }

                // undefined disconnect (unsigned long output);
                if let Some(Either21::A(output)) = output_or_dest {
                    let output: usize = output.try_into().unwrap();
                    self.inner.disconnect_output(output);
                    return;
                }

                // at this point, we are sure that first argument is either an AudioNode or an AudioParam
                let dest = output_or_dest.unwrap();

                if output.is_none() && input.is_some() {
                    panic!("Invalid disconnect call");
                }

                match dest {
                    // undefined disconnect (AudioParam destinationParam);
                    // undefined disconnect (AudioParam destinationParam, unsigned long output);
                    Either21::B(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            _ => unreachable!(),
                        }
                    }
                    // undefined disconnect (AudioNode destinationNode);
                    // undefined disconnect (AudioNode destinationNode, unsigned long output);
                    // undefined disconnect (AudioNode destinationNode, unsigned long output, unsigned long input);
                    Either21::C(dest) => {
                        let dest = dest.inner.as_ref();

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }

                    Either21::D(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::E(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::F(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::G(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::H(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::I(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::J(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::K(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::L(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::M(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::N(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::O(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::P(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::Q(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::R(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::S(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::T(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }
                    Either21::U(dest) => {
                        let dest = &dest.inner;

                        match (output, input) {
                            (None, None) => self.inner.disconnect_dest(dest),
                            (Some(output), None) => {
                                let output: usize = output.try_into().unwrap();
                                self.inner.disconnect_dest_from_output(dest, output);
                            }
                            (Some(output), Some(input)) => {
                                let output: usize = output.try_into().unwrap();
                                let input: usize = input.try_into().unwrap();
                                self.inner
                                    .disconnect_dest_from_output_to_input(dest, output, input);
                            }
                            _ => unreachable!(),
                        }
                    }

                    _ => unreachable!(), // Either::A handled before match
                }
            }
        }
    };
}
