#[macro_export]
macro_rules! base_audio_context_impl {
    ($napi_struct:ident) => {
        #[napi]
        impl $napi_struct {
            #[napi(getter, js_name = "currentTime")]
            pub fn current_time(&self) -> f64 {
                self.inner.current_time()
            }

            #[napi(getter, js_name = "sampleRate")]
            pub fn sample_rate(&self) -> f32 {
                self.inner.sample_rate()
            }

            #[napi(getter, js_name = "renderQuantumSize")]
            pub fn render_quantum_size(&self) -> u32 {
                128
            }

            #[napi(getter, js_name = "state")]
            pub fn state(&self) -> String {
                let str = match self.inner.state() {
                    web_audio_api::context::AudioContextState::Suspended => "suspended",
                    web_audio_api::context::AudioContextState::Running => "running",
                    web_audio_api::context::AudioContextState::Closed => "closed",
                };

                String::from(str)
            }

            // #[napi(getter, js_name = "listener")]
            // pub fn listener(&self);

            // #[napi(js_name = "decodeAudioData")]
            // fn decode_audio_data();
        }
    };
}
