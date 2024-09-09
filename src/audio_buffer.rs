use napi::*;
use napi_derive::js_function;
use std::mem::ManuallyDrop;
use web_audio_api::{AudioBuffer, AudioBufferOptions};

pub(crate) struct NapiAudioBuffer(Option<AudioBuffer>);

// for debug purpose
// impl Drop for NapiAudioBuffer {
//     fn drop(&mut self) {
//         println!("NAPI: NapiAudioBuffer dropped");
//     }
// }

impl NapiAudioBuffer {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "AudioBuffer",
            constructor,
            &[
                Property::new("sampleRate")?.with_getter(sample_rate),
                Property::new("duration")?.with_getter(duration),
                Property::new("length")?.with_getter(length),
                Property::new("numberOfChannels")?.with_getter(number_of_channels),
                Property::new("getChannelData")?.with_method(get_channel_data),
                Property::new("copyToChannel")?.with_method(copy_to_channel),
                Property::new("copyFromChannel")?.with_method(copy_from_channel),
            ],
        )
    }

    pub fn unwrap(&self) -> &AudioBuffer {
        // for debug purpose
        if self.0.is_none() {
            panic!("AudioBuffer - Invalid unwrap() call, inner AudioBuffer not yet set");
        }

        self.0.as_ref().unwrap()
    }

    pub fn unwrap_mut(&mut self) -> &mut AudioBuffer {
        // for debug purpose
        if self.0.is_none() {
            panic!("AudioBuffer - Invalid unwrap_mut() call, inner AudioBuffer not yet set");
        }

        self.0.as_mut().unwrap()
    }

    pub fn insert(&mut self, audio_buffer: AudioBuffer) {
        // for debug purpose
        if self.0.is_some() {
            panic!("AudioBuffer - Invalid insert() call, inner AudioBuffer already set");
        }

        self.0 = Some(audio_buffer);
    }

    pub fn take(&mut self) -> AudioBuffer {
        self.0
            .take()
            .expect("Invalid AudioBuffer.take() call, should be populated")
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_options = ctx.get::<JsUnknown>(0)?;

    match js_options.get_type()? {
        ValueType::Null => {
            // Internal caller
            // - BaseAudioContext::decodeAudioData
            // - OfflineAudioContext::startRendering
            // - AudioProcessingEvent::{inputBuffer, outputBuffer}
            let napi_node = NapiAudioBuffer(None);
            ctx.env.wrap(&mut js_this, napi_node)?;
        }
        ValueType::Object => {
            // Public API
            let js_options = js_options.coerce_to_object()?;

            let number_of_channels = js_options
                .get::<&str, JsNumber>("numberOfChannels")?
                .unwrap()
                .get_double()? as usize;

            let length = js_options
                .get::<&str, JsNumber>("length")?
                .unwrap()
                .get_double()? as usize;

            let sample_rate = js_options
                .get::<&str, JsNumber>("sampleRate")?
                .unwrap()
                .get_double()? as f32;

            let options = AudioBufferOptions {
                number_of_channels,
                length,
                sample_rate,
            };

            let audio_buffer = AudioBuffer::new(options);
            let napi_node = NapiAudioBuffer(Some(audio_buffer));
            ctx.env.wrap(&mut js_this, napi_node)?
        }
        _ => unreachable!(),
    }

    ctx.env.get_undefined()
}

#[js_function]
fn sample_rate(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap();

    let sample_rate = obj.sample_rate();
    ctx.env.create_double(sample_rate as f64)
}

#[js_function]
fn duration(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap();

    let duration = obj.duration();
    ctx.env.create_double(duration)
}

#[js_function]
fn length(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap();

    let length = obj.length();
    ctx.env.create_double(length as f64)
}

#[js_function]
fn number_of_channels(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap();

    let number_of_channels = obj.number_of_channels();
    ctx.env.create_double(number_of_channels as f64)
}

#[js_function(3)]
fn copy_to_channel(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap_mut();

    let source_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let source: &[f32] = source_js.as_ref();

    let channel_number = ctx.get::<JsNumber>(1)?.get_double()? as usize;
    let offset = ctx.get::<JsNumber>(2)?.get_double()? as usize;

    obj.copy_to_channel_with_offset(source, channel_number, offset);

    ctx.env.get_undefined()
}

#[js_function(3)]
fn copy_from_channel(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap_mut();

    let mut dest_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let dest: &mut [f32] = dest_js.as_mut();

    let channel_number = ctx.get::<JsNumber>(1)?.get_double()? as usize;
    let offset = ctx.get::<JsNumber>(2)?.get_double()? as usize;

    obj.copy_from_channel_with_offset(dest, channel_number, offset);

    ctx.env.get_undefined()
}

// @FIXME - cf. https://github.com/ircam-ismm/node-web-audio-api/issues/80
#[js_function(1)]
fn get_channel_data(ctx: CallContext) -> Result<JsTypedArray> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap_mut();

    let channel_number = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    let length = obj.length();

    let channel_data = obj.get_channel_data_mut(channel_number);
    let data = unsafe {
        std::slice::from_raw_parts_mut(channel_data.as_ptr() as *mut _, channel_data.len() * 4)
    };

    // unsafe version but returned array buffer IS mutable from the javascript
    let data_ptr = data.as_mut_ptr();
    let ptr_length = data.len();
    let manually_drop = ManuallyDrop::new(data);

    unsafe {
        ctx.env
            .create_arraybuffer_with_borrowed_data(
                data_ptr,
                ptr_length,
                manually_drop,
                noop_finalize,
            )
            .map(|array_buffer| {
                array_buffer
                    .into_raw()
                    .into_typedarray(TypedArrayType::Float32, length, 0)
            })
            .unwrap()
    }
}
