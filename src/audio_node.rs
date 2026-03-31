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
            pub fn get_number_of_outputs(&self) -> u32 {
                self.inner.number_of_outputs() as u32
            }

            // @todo - make it dynamic
            #[napi]
            pub fn connect(
                &mut self,
                dest: Either5<
                    &$crate::audio_param::NapiAudioParam,
                    &$crate::audio_destination_node::NapiAudioDestinationNode,
                    &$crate::audio_buffer_source_node::NapiAudioBufferSourceNode,
                    &$crate::gain_node::NapiGainNode,
                    &$crate::oscillator_node::NapiOscillatorNode,
                >,
                output: Option<u32>,
                input: Option<u32>,
            ) {
                let output = output.unwrap_or(0) as usize;
                let input = input.unwrap_or(0) as usize;

                match dest {
                    Either5::A(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either5::B(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }

                    Either5::C(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either5::D(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either5::E(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                }
            }
        }
    };
}
