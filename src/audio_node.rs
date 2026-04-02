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

            #[napi(setter, js_name = "channelCount")]
            pub fn set_channel_count(&self, channel_count: u32) {
                self.inner.set_channel_count(channel_count as usize);
            }

            #[napi(setter, js_name = "channelCountMode")]
            pub fn get_channel_count_mode(&self) -> String {
                let channel_count_mode = self.inner.channel_count_mode();
                let channel_count_mode = match channel_count_mode {
                    ChannelCountMode::Max => "max",
                    ChannelCountMode::ClampedMax => "clamped-max",
                    ChannelCountMode::Explicit => "explicit",
                };
                channel_count_mode.into()
            }

            #[napi(setter, js_name = "channelCountMode")]
            pub fn set_channel_count_mode(&self, channel_count_mode: String) {
                let channel_count_mode = match channel_count_mode.as_str() {
                    "max" => ChannelCountMode::Max,
                    "clamped-max" => ChannelCountMode::ClampedMax,
                    "explicit" => ChannelCountMode::Explicit,
                    _ => unreachable!(),
                };
                self.inner.set_channel_count_mode(channel_count_mode);
            }

            #[napi(setter, js_name = "channelInterpretation")]
            pub fn get_channel_interpretation(&self) -> String {
                let channel_interpretation = self.inner.channel_interpretation();
                let channel_interpretation = match channel_interpretation {
                    ChannelInterpretation::Speakers => "speakers",
                    ChannelInterpretation::Discrete => "discrete",
                };
                channel_interpretation.into()
            }

            #[napi(setter, js_name = "channelInterpretation")]
            pub fn set_channel_interpretation(&self, channel_interpretation: String) {
                let channel_interpretation = match channel_interpretation.as_str() {
                    "speakers" => ChannelInterpretation::Speakers,
                    "discrete" => ChannelInterpretation::Discrete,
                    _ => unreachable!(),
                };
                self.inner
                    .set_channel_interpretation(channel_interpretation);
            }

            #[napi]
            pub fn connect(
                &mut self,
                dest: Either11<
                    &$crate::audio_param::NapiAudioParam,
                    &$crate::audio_destination_node::NapiAudioDestinationNode,
                    &$crate::analyser_node::NapiAnalyserNode,
                    &$crate::audio_buffer_source_node::NapiAudioBufferSourceNode,
                    &$crate::biquad_filter_node::NapiBiquadFilterNode,
                    &$crate::channel_merger_node::NapiChannelMergerNode,
                    &$crate::channel_splitter_node::NapiChannelSplitterNode,
                    &$crate::constant_source_node::NapiConstantSourceNode,
                    &$crate::convolver_node::NapiConvolverNode,
                    &$crate::gain_node::NapiGainNode,
                    &$crate::oscillator_node::NapiOscillatorNode,
                >,
                output: Option<u32>,
                input: Option<u32>,
            ) {
                let output: usize = output.unwrap_or(0).try_into().unwrap();
                let input: usize = input.unwrap_or(0).try_into().unwrap();

                match dest {
                    Either11::A(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::B(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }

                    Either11::C(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::D(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::E(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::F(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::G(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::H(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::I(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::J(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either11::K(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                }
            }

            #[napi]
            pub fn disconnect(
                &mut self,
                output_or_dest: Option<
                    Either12<
                        u32,
                        &$crate::audio_param::NapiAudioParam,
                        &$crate::audio_destination_node::NapiAudioDestinationNode,
                        &$crate::analyser_node::NapiAnalyserNode,
                        &$crate::audio_buffer_source_node::NapiAudioBufferSourceNode,
                        &$crate::biquad_filter_node::NapiBiquadFilterNode,
                        &$crate::channel_merger_node::NapiChannelMergerNode,
                        &$crate::channel_splitter_node::NapiChannelSplitterNode,
                        &$crate::constant_source_node::NapiConstantSourceNode,
                        &$crate::convolver_node::NapiConvolverNode,
                        &$crate::gain_node::NapiGainNode,
                        &$crate::oscillator_node::NapiOscillatorNode,
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
                if let Some(Either12::A(output)) = output_or_dest {
                    let output: usize = output.try_into().unwrap();
                    self.inner.disconnect_output(output);
                    return;
                }

                // from this point, we are sure arg[0] is either an AudioNode or an AudioParam
                let dest = output_or_dest.unwrap();

                if output.is_none() && input.is_some() {
                    panic!("Invalid disconnect call");
                }

                match dest {
                    // undefined disconnect (AudioParam destinationParam);
                    // undefined disconnect (AudioParam destinationParam, unsigned long output);
                    Either12::B(dest) => {
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
                    Either12::C(dest) => {
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

                    Either12::D(dest) => {
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
                    Either12::E(dest) => {
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
                    Either12::F(dest) => {
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
                    Either12::G(dest) => {
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
                    Either12::H(dest) => {
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
                    Either12::I(dest) => {
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
                    Either12::J(dest) => {
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
                    Either12::K(dest) => {
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
                    Either12::L(dest) => {
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

                    _ => unreachable!(), // Either::A already handled
                }
            }
        }
    };
}
