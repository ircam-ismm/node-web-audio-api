use napi::*;
use napi_derive::js_function;
use std::mem::ManuallyDrop;
use web_audio_api::{AudioBuffer, AudioBufferOptions};

pub(crate) struct NapiAudioBuffer(Option<AudioBuffer>);

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
        if self.0.is_none() {
            panic!("AudioBuffer - invalid unwrap call, inner AudioBuffer not yet set");
        } else {
            self.0.as_ref().unwrap()
        }
    }

    pub fn unwrap_mut(&mut self) -> &mut AudioBuffer {
        if self.0.is_none() {
            panic!("AudioBuffer - invalid unwrap call, inner AudioBuffer not yet set");
        } else {
            self.0.as_mut().unwrap()
        }
    }

    pub fn populate(&mut self, audio_buffer: AudioBuffer) {
        self.0 = Some(audio_buffer);
    }
}

// dictionary AudioBufferOptions {
//   unsigned long numberOfChannels = 1;
//   required unsigned long length;
//   required float sampleRate;
// };
#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    // JS wrapper guarantees we have an option object
    let options_js = ctx.get::<JsObject>(0)?;
    // created by decodeAudioData (to be cleaned)
    if options_js.has_own_property("__internal_caller__")? {
        let napi_node = NapiAudioBuffer(None);
        ctx.env.wrap(&mut js_this, napi_node)?;
    } else {
        let some_number_of_channels_js = options_js.get::<&str, JsNumber>("numberOfChannels")?;
        let number_of_channels = if let Some(number_of_channels_js) = some_number_of_channels_js {
            number_of_channels_js.get_double()? as usize
        } else {
            1
        };

        let some_length_js = options_js.get::<&str, JsNumber>("length")?;
        if some_length_js.is_none() {
            return Err(napi::Error::new(
                napi::Status::InvalidArg,
                "TypeError - Failed to construct 'AudioBuffer': Failed to read the 'length' property from 'AudioBufferOptions': Required member is undefined.".to_string(),
            ));
        }
        let length = some_length_js.unwrap().get_double()? as usize;

        let some_sample_rate_js = options_js.get::<&str, JsNumber>("sampleRate")?;
        if some_sample_rate_js.is_none() {
            return Err(napi::Error::new(
                napi::Status::InvalidArg, // error code
                "TypeError - Failed to construct 'AudioBuffer': Failed to read the 'sampleRate' property from 'AudioBufferOptions': Required member is undefined."
                    .to_string(),
            ));
        }
        let sample_rate = some_sample_rate_js.unwrap().get_double()? as f32;

        let audio_buffer = AudioBuffer::new(AudioBufferOptions {
            number_of_channels,
            length,
            sample_rate,
        });

        let napi_node = NapiAudioBuffer(Some(audio_buffer));
        ctx.env.wrap(&mut js_this, napi_node)?
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

// # FIXME
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
