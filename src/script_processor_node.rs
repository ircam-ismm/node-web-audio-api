use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::node::*;

use crate::*;

// https://users.rust-lang.org/t/vec-f32-to-u8/21522/5
fn to_byte_slice_f32(floats: &[f32]) -> &[u8] {
    unsafe { std::slice::from_raw_parts(floats.as_ptr() as *const _, floats.len() * 4) }
}

fn from_byte_slice_f32(uin8: &[u8]) -> &[f32] {
    unsafe { std::slice::from_raw_parts(uin8.as_ptr() as *const _, uin8.len() / 4) }
}

fn to_byte_slice_f64(double: &[f64]) -> &[u8] {
    unsafe { std::slice::from_raw_parts(double.as_ptr() as *const _, double.len() * 8) }
}

#[napi(js_name = NapiScriptProcessorNode)]
pub struct NapiScriptProcessorNode {
    pub(crate) inner: ScriptProcessorNode,
}

audio_node_impl!(NapiScriptProcessorNode);

#[napi]
impl NapiScriptProcessorNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        let buffer_size = options.get::<u32>("bufferSize");
        let buffer_size = match buffer_size {
            Ok(buffer_size) => match buffer_size {
                Some(buffer_size) => buffer_size as usize,
                None => panic!("No default value for bufferSize in ScriptProcessorOptions"),
            },
            Err(_) => panic!("No default value for bufferSize in ScriptProcessorOptions"),
        };

        let number_of_input_channels = options.get::<u32>("numberOfInputChannels");
        let number_of_input_channels = match number_of_input_channels {
            Ok(number_of_input_channels) => match number_of_input_channels {
                Some(number_of_input_channels) => number_of_input_channels as usize,
                None => panic!("No default value for bufferSize in ScriptProcessorOptions"),
            },
            Err(_) => panic!("No default value for bufferSize in ScriptProcessorOptions"),
        };

        let number_of_output_channels = options.get::<u32>("numberOfOutputChannels");
        let number_of_output_channels = match number_of_output_channels {
            Ok(number_of_output_channels) => match number_of_output_channels {
                Some(number_of_output_channels) => number_of_output_channels as usize,
                None => panic!("No default value for bufferSize in ScriptProcessorOptions"),
            },
            Err(_) => panic!("No default value for bufferSize in ScriptProcessorOptions"),
        };

        let options = ScriptProcessorOptions {
            buffer_size,
            number_of_input_channels,
            number_of_output_channels,
        };

        let native_node = match context {
            Either::A(context) => {
                let native_context = context.unwrap();
                ScriptProcessorNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                ScriptProcessorNode::new(native_context, options)
            }
        };

        Self { inner: native_node }
    }

    #[napi(getter)]
    pub fn buffer_size(&self) -> u32 {
        self.inner.buffer_size() as u32
    }

    #[napi(catch_unwind)]
    pub fn onaudioprocess(&self, callback: Function<Buffer, Buffer>) -> Result<()> {
        let tsfn = callback
            .build_threadsafe_function()
            .weak::<true>() // do not prevent process to exit
            .build_callback(
                |ctx: napi::threadsafe_function::ThreadsafeCallContext<Vec<u8>>| {
                    // just convert Vec<u8> into JS Buffer
                    let data: Buffer = ctx.value.into();
                    Ok(data)
                },
            )?;

        // @todo - cf. https://github.com/ircam-ismm/node-web-audio-api/issues/173
        self.inner.set_onaudioprocess(move |mut e| {
            // Pack playback time and input buffer channels into JS Buffer
            let playback_time = e.playback_time;
            let input_buffer = e.input_buffer.clone();
            let buffer_len = std::mem::size_of::<f64>()
                + (input_buffer.number_of_channels()
                    * input_buffer.length()
                    * std::mem::size_of::<f32>());
            let mut data: Vec<u8> = Vec::with_capacity(buffer_len);

            let playback_time = [playback_time];
            let playback_time: &[u8] = to_byte_slice_f64(&playback_time);
            data.extend_from_slice(playback_time);

            for channel_number in 0..input_buffer.number_of_channels() {
                let channel_data = input_buffer.get_channel_data(channel_number);
                let channel_data = to_byte_slice_f32(channel_data);
                data.extend_from_slice(channel_data);
            }

            tsfn.call_with_return_value(
                data,
                napi::threadsafe_function::ThreadsafeFunctionCallMode::Blocking,
                move |ret, _| {
                    if let Ok(buffer) = ret {
                        // unpack JS Buffer returned from callback into Rust output buffer
                        let data: Vec<u8> = buffer.into();
                        let data = from_byte_slice_f32(&data);
                        let buffer_size = e.output_buffer.length();

                        for channel_number in 0..e.output_buffer.number_of_channels() {
                            let start_offset = channel_number * buffer_size;
                            let end_offset = (channel_number + 1) * buffer_size;
                            let channel_data = &data[start_offset..end_offset];
                            e.output_buffer
                                .copy_to_channel(channel_data, channel_number);
                        }
                    }

                    Ok(())
                },
            );
        });

        Ok(())
    }
}
