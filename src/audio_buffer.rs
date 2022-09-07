use napi::{
    CallContext, Either, Env, JsBoolean, JsFunction, JsNumber, JsObject, JsTypedArray, JsUndefined,
    Property, Result, TypedArrayType,
};

use napi_derive::js_function;

use web_audio_api::AudioBuffer;

// helper convert [f32] to [u8]
// https://users.rust-lang.org/t/vec-f32-to-u8/21522/7
fn to_byte_slice<'a>(floats: &'a [f32]) -> &'a [u8] {
    unsafe { std::slice::from_raw_parts(floats.as_ptr() as *const _, floats.len() * 4) }
}

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

    pub fn populate(&mut self, audio_buffer: AudioBuffer) {
        self.0 = Some(audio_buffer);
    }
}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    // A should be an object, but it does not compile anymore for some reason...
    // let arg = ctx.get::<Either<JsObject, JsBoolean>>(0)?;
    let arg = ctx.get::<Either<JsNumber, JsBoolean>>(0)?;

    match arg {
        Either::A(_obj) => {
            todo!();
        }
        // private constructor for decode_audio_data
        Either::B(_bool) => {
            let napi_node = NapiAudioBuffer(None);
            ctx.env.wrap(&mut js_this, napi_node)?;
        }
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
    ctx.env.create_double(duration as f64)
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

#[js_function(1)]
fn get_channel_data(ctx: CallContext) -> Result<JsTypedArray> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_obj = ctx.env.unwrap::<NapiAudioBuffer>(&js_this)?;
    let obj = napi_obj.unwrap();

    let channel_number = ctx.get::<JsNumber>(0)?.get_double()? as usize;
    let channel_data = obj.get_channel_data(channel_number);
    let length = obj.length();
    // convert channel [f32] to [u8]
    let data = to_byte_slice(channel_data);
    // create array buffer and cast it into Float32Array
    ctx.env
        .create_arraybuffer_with_data(data.to_vec())
        .and_then(|array_buffer| {
            array_buffer
                .into_raw()
                .into_typedarray(TypedArrayType::Float32, length, 0)
        })
}
