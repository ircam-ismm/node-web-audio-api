#[macro_export]
macro_rules! base_audio_context_impl {
    ($napi_struct:ident, $native_struct:ident) => {
        pub struct DecodeAudioDataTask {
            context: Arc<$native_struct>,
            data: Option<std::io::Cursor<Vec<u8>>>,
        }

        impl DecodeAudioDataTask {
            fn new(context: Arc<$native_struct>, data: Option<std::io::Cursor<Vec<u8>>>) -> Self {
                Self { context, data }
            }
        }

        #[napi]
        impl Task for DecodeAudioDataTask {
            type Output = web_audio_api::AudioBuffer;
            type JsValue = $crate::NapiAudioBuffer;

            fn compute(&mut self) -> Result<Self::Output> {
                let buffer = self.data.take().unwrap();
                let result = self.context.decode_audio_data_sync(buffer);

                match result {
                    Ok(audio_buffer) => Ok(audio_buffer),
                    Err(e) => Err(Error::from_reason(e.to_string())),
                }
            }

            fn resolve(&mut self, _: Env, output: Self::Output) -> Result<Self::JsValue> {
                let audio_buffer = $crate::NapiAudioBuffer::from(output);
                Ok(audio_buffer)
            }
        }

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

            #[napi(js_name = "decodeAudioData")]
            pub fn decode_audio_data(
                &self,
                array_buffer: ArrayBuffer<'_>,
            ) -> AsyncTask<DecodeAudioDataTask> {
                let context = self.inner.clone();
                // @todo - remove the copy from `to_vec`
                let cursor = std::io::Cursor::new(array_buffer.to_vec());

                let task = DecodeAudioDataTask::new(context, Some(cursor));
                AsyncTask::new(task)
            }
        }
    };
}
