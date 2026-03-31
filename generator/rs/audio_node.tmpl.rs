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
                dest: Either${d.nodes.length + 2}<
                    &$crate::audio_param::NapiAudioParam,
                    &$crate::audio_destination_node::NapiAudioDestinationNode,
                    ${d.nodes.map(n => {
                        return `&$crate::${d.slug(n)}::${d.napiName(n)}`;
                    })}
                >,
                output: Option<u32>,
                input: Option<u32>,
            ) {
                let output = output.unwrap_or(0) as usize;
                let input = input.unwrap_or(0) as usize;

                match dest {
                    Either${d.nodes.length + 2}::A(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    Either${d.nodes.length + 2}::B(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                    ${d.nodes.map((_, index) => {
                        // A if 65
                        return `
                    Either${d.nodes.length + 2}::${String.fromCharCode(index + 65 + 2)}(dest) => {
                        self.inner
                            .connect_from_output_to_input(&dest.inner, output, input);
                    }
                        `;
                    })}
                }
            }
        }
    }
}
